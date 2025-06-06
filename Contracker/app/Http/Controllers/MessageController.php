<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\DeviceMessage;
use App\Models\ContrackerDevice;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'uuid' => 'required|string',
            'message' => 'required|string',
        ]);

        $device = ContrackerDevice::where('uuid', $validated['uuid'])->first();
        $deviceName = $device && $device->name ? $device->name : 'Unknown Device (' . substr($validated['uuid'], 0, 8) . ')';

        broadcast(new DeviceMessage($validated['uuid'], $validated['message'], $deviceName))->toOthers();

        return response()->json(['status' => 'Message sent']);
    }
}
