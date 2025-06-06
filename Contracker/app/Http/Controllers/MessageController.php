<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\DeviceMessage;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'uuid' => 'required|string',
            'message' => 'required|string',
        ]);

        broadcast(new DeviceMessage($request->uuid, $request->message));

        return response()->json(['status' => 'Message sent']);
    }
}
