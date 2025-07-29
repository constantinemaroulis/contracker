<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\ContrackerDevice;
use App\Models\ContrackerJob;
use App\Models\ContrackerJobLocation;
use Illuminate\Http\Request;

class TimeclockController extends Controller
{
    public function clockIn(Request $request, $jobId, $uuid)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $device = ContrackerDevice::where('uuid', $uuid)->firstOrFail();
        $job = ContrackerJob::findOrFail($jobId);

        // Check geofence
        $location = ContrackerJobLocation::with('geofence')->where('job_id', $job->id)->first();
        if ($location && $location->geofence) {
            $points = json_decode($location->geofence->boundary_points, true);
            if (!$this->pointInPolygon($request->latitude, $request->longitude, $points)) {
                return response()->json(['error' => 'Device not within geofence'], 403);
            }
        }

        $existing = TimeEntry::where('device_id', $device->id)
            ->where('job_id', $job->id)
            ->whereNull('end_time')
            ->first();
        if ($existing) {
            return response()->json(['error' => 'Already clocked in'], 409);
        }

        $entry = TimeEntry::create([
            'device_id' => $device->id,
            'job_id' => $job->id,
            'start_time' => now(),
            'face_in' => $request->input('face_in'),
            'signature_in' => $request->input('signature_in'),
        ]);

        return response()->json($entry, 201);
    }

    public function clockOut(Request $request, $jobId, $uuid)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $device = ContrackerDevice::where('uuid', $uuid)->firstOrFail();
        $job = ContrackerJob::findOrFail($jobId);

        $entry = TimeEntry::where('device_id', $device->id)
            ->where('job_id', $job->id)
            ->whereNull('end_time')
            ->first();
        if (!$entry) {
            return response()->json(['error' => 'No active entry'], 404);
        }

        // Geofence check
        $location = ContrackerJobLocation::with('geofence')->where('job_id', $job->id)->first();
        if ($location && $location->geofence) {
            $points = json_decode($location->geofence->boundary_points, true);
            if (!$this->pointInPolygon($request->latitude, $request->longitude, $points)) {
                return response()->json(['error' => 'Device not within geofence'], 403);
            }
        }

        $entry->update([
            'end_time' => now(),
            'face_out' => $request->input('face_out'),
            'signature_out' => $request->input('signature_out'),
        ]);

        return response()->json($entry);
    }

    public function currentEntry($jobId, $uuid)
    {
        $device = ContrackerDevice::where('uuid', $uuid)->firstOrFail();
        $entry = TimeEntry::where('device_id', $device->id)
            ->where('job_id', $jobId)
            ->whereNull('end_time')
            ->first();
        return response()->json($entry);
    }

    private function distance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }

    private function pointInPolygon($lat, $lng, array $polygon): bool
    {
        $inside = false;
        $points = count($polygon);
        for ($i = 0, $j = $points - 1; $i < $points; $j = $i++) {
            $xi = $polygon[$i][0];
            $yi = $polygon[$i][1];
            $xj = $polygon[$j][0];
            $yj = $polygon[$j][1];

            $intersect = (($yi > $lng) != ($yj > $lng)) &&
                ($lat < ($xj - $xi) * ($lng - $yi) / ($yj - $yi + 0.0000001) + $xi);
            if ($intersect) {
                $inside = !$inside;
            }
        }
        return $inside;
    }
}
