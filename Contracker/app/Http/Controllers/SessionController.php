<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContrackerDevice;
use App\Models\ContrackerJob;
use App\Models\ContrackerJobLocation;
use App\Models\ContrackerJobGeofence;



use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;




class SessionController extends Controller
{
    public function store(Request $request)
    {
        $request->session()->put('key', $request->input('value'));
        return response()->json(['status' => 'stored']);
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
            \Log::error('Device not saved in DB:', $validated);
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
            return response()->json(['error' => 'Device not found'], 404);
        }
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
        $location = \App\Models\ContrackerJobLocation::with('geofence')->where('job_id', $jobId)->first();

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
}
