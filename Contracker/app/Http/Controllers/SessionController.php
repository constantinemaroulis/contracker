<?php

namespace App\Http\Controllers;

use App\Events\DeviceCommand;
use App\Events\DeviceMessage;
use Illuminate\Http\Request;
use App\Models\ContrackerDevice;
use App\Models\ContrackerJob;
use App\Models\ContrackerJobLocation;
use App\Models\ContrackerJobGeofence;

use Inertia\Inertia;
use Inertia\Response;

use Carbon\Carbon;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;



class SessionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'required|uuid',
            'message' => 'required|string|max:255',
        ]);

        $device = ContrackerDevice::where('uuid', $validated['uuid'])->firstOrFail();

        // Broadcast a command using the updated Event structure
        broadcast(new DeviceCommand(
            $device->uuid,
            'message', // The command
            ['message' => $validated['message']] // The payload
        ));

        return response()->json(['message' => 'Command sent to device.']);
    }

    public function get(Request $request)
    {
        return response()->json(['value' => $request->session()->get('key')]);
    }

    public function destroy(Request $request)
    {
        $request->session()->forget('key');
        return response()->json(['status' => 'destroyed']);
    }

    public function registerDevice(Request $request)
    {
         $validated = $request->validate([
            'uuid' => 'required|string|uuid',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'numeric|min:0',
        ]);

        $device = ContrackerDevice::updateOrCreate(
            ['uuid' => $validated['uuid']],
            ['latitude' => $validated['latitude'], 'longitude' => $validated['longitude'], 'accuracy' => $validated['accuracy']]
        );

        if (!$device) {
            Log::error('Device not saved in DB:', $validated);
            return response()->json(['error' => 'Database save failed'], 500);
        }




        return response()->json([
            'status' => 'device_registered',
            'device' => $device,
        ]);
    }

    public function getDevice(Request $request, $uuid)
    {
        try {
            $device = ContrackerDevice::where('uuid', $uuid)->firstOrFail();
            return response()->json(['device' => $device]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Device not found!'], 404);
        }
    }

    /**
     * Get the public IP address of the incoming request.
     */

    public function getDeviceIp(Request $request)

    {
        return response()->json(['ip' => $request->ip()]);
    }

    public function getDeviceDiff(Request $request, $uuid)
    {
        try {
            $device = ContrackerDevice::where('uuid', $uuid)->firstOrFail();
            $jobLocation = ContrackerJobLocation::where('job_id', $device->job_id)->first();

            if (!$jobLocation) {
                return response()->json(['error' => 'Job location not found'], 404);
            }

            // Custom distance threshold (meters)
            $distanceThreshold = 200;

            // Calculate distance using Haversine formula
            $distance = DB::select("
                SELECT (6371000 * acos(
                    cos(radians(?)) * cos(radians(?))
                    * cos(radians(?) - radians(?))
                    + sin(radians(?)) * sin(radians(?))
                )) AS distance
            ", [
                $device->latitude,
                $jobLocation->latitude,
                $jobLocation->longitude,
                $device->longitude,
                $device->latitude,
                $jobLocation->latitude
            ])[0]->distance;

            $status = ($distance <= $distanceThreshold) ? "OK TO GO" : "TOO FAR";

            if ($status !== "TOO FAR") {
                // Update the job status if within distance threshold
                $job = ContrackerJob::where('id', $device->job_id)->first();
            }
            // Log the distance and status
            Log::info("Device UUID: {$device->uuid}, Distance: {$distance}, Status: {$status}");

            return response()->json([
                'device' => $device,
                'job_location' => $jobLocation,
                'distance' => round($distance, 2), // Rounded for readability
                'status' => $status
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Device not found'], 404);
        }
    }

    public function getJobs()
    {
        $jobs = ContrackerJob::all();
        return response()->json(['jobs' => $jobs]);
    }

    // File: app/Http/Controllers/SessionController.php

    public function getJobLocation($jobId)
    {
        // Eager load the geofence relationship.
        $location = ContrackerJobLocation::with('geofence')->where('job_id', $jobId)->first();

        if (!$location) {
            return response()->json(['error' => 'Job location not found'], 404);
        }

        // Return the location; if a geofence exists, its boundary_points will be included.
        return response()->json(['location' => $location]);
    }


    public function saveGeofence(Request $request)
    {
        $validated = $request->validate([
            'job_location_id' => 'required|exists:contracker_jobs_location,id',
            'boundary_points' => 'required|json',
        ]);

        $geofence = ContrackerJobGeofence::updateOrCreate(
            ['job_location_id' => $validated['job_location_id']],
            ['boundary_points' => $validated['boundary_points']]
        );

        return response()->json(['status' => 'Geofence saved!', 'geofence' => $geofence]);
    }

    public function updateDeviceName(Request $request, $uuid)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'device_type' => 'nullable|string|max:255',
            'local_ip' => 'nullable|string|max:255',
            'public_ip' => 'nullable|string|max:255',
            'mac_address' => 'nullable|string|max:255',
            'device_details' => 'nullable|string',
        ]);

        $device = ContrackerDevice::where('uuid', $uuid)->first();

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $device->update($request->only([
            'name',
            'device_type',
            'local_ip',
            'public_ip',
            'mac_address',
            'device_details',
        ]));

        // return response()->json(['success' => true, 'device' => $device]);
        return back()->with('success', 'Device details updated successfully!');
    }


    public function listDevices(Request $request)
    {
        /** @var \Carbon\Carbon $now */
        $now = now();
        $devices = ContrackerDevice::all()->map(function ($device) use ($now) {
            $device->online = $device->last_seen && ($now->diffInMinutes($device->last_seen)*-1) <= 3; // Device is online if last seen within 5 minutes
            $device->last_ping = $now->diffInMinutes($device->last_seen)*-1;
            return $device;
        });

        if ($request->wantsJson()) {
            return response()->json(['devices' => $devices]);
        }

        return Inertia::render('Devices', [
            'devices' => $devices
        ]);
    }

    public function sendDeviceCommand(Request $request, $uuid)
    {
        $validated = $request->validate([
            'command' => 'required|string',
            'payload' => 'sometimes|array',
            'sender_uuid' => 'sometimes|string'
        ]);

        $senderUuid = $validated['sender_uuid'] ?? ($request->user()->id ?? 'admin');


        if ($validated['command'] === 'typing') {
            // Admin typing indicator
            event(new DeviceCommand($uuid, 'typing', ['recipient_uuid' => $uuid], $senderUuid));
            return response()->json(['status' => 'Typing signal broadcast']);
        }

        // If admin is sending a chat message  if ($validated['command'] === 'message' && isset($validated['payload']['message'])) {
        if ($validated['command'] === 'message') {
            $messageText = $validated['payload']['message'];
            $messageId = $validated['payload']['messageId'] ?? null;
            // Broadcast chat message to the device's channel
            event(new DeviceCommand($uuid, 'message', [
                'message' => $messageText,
                'messageId' => $messageId,
                'recipient_uuid' => $uuid
            ], $senderUuid));
            $senderId = $senderUuid;
            // Store in DB for history (sender is admin, receiver is device)
            \Illuminate\Support\Facades\DB::table('contracker_messages')->insert([
                'conversation_id' => $uuid,
                'sender_id' => $senderId,
                'receiver_id' => $uuid,
                'message' => $messageText,
                'created_at' => now(),
                'updated_at' => now(),
                'read_at' => null  // device has not read yet
            ]);
            return response()->json(['status' => 'Message sent']);
        }

        // If this is an acknowledgment or other command (typing, ack, etc.)
        event(new DeviceCommand($uuid, $validated['command'], $validated['payload'] ?? [], $senderUuid));
        return response()->json(['status' => 'Command sent']);
    }


}
