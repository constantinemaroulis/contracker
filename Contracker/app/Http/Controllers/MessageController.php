<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\DeviceMessage;
use App\Events\DeviceCommand;
use App\Models\ContrackerDevice;

class MessageController extends Controller
{

    public function send(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'required|string',
            'message' => 'nullable|string',
            'messageId' => 'sometimes|string',
            'ack' => 'sometimes|boolean',
            'status' => 'sometimes|string',
            'typing' => 'sometimes|boolean',
            'sender_uuid' => 'sometimes|string',
            'recipient_uuid' => 'sometimes|string'
        ]);

        $deviceUuid = $validated['uuid'];
        $text = $validated['message'] ?? '';
        $senderUuid = $validated['sender_uuid'] ?? $deviceUuid;
        $recipientUuid = $validated['recipient_uuid'] ?? 'admin';

        if (!empty($validated['typing'])) {
            // Device is notifying that it is typing
            broadcast(new DeviceCommand($deviceUuid, 'typing', ['recipient_uuid' => $recipientUuid], $senderUuid));
            return response()->json(['status' => 'Typing signal sent']);
        }

        if (!empty($validated['ack']) && isset($validated['messageId'], $validated['status'])) {
            // This is an acknowledgment from a device that a message was delivered/read.
            broadcast(new DeviceCommand($deviceUuid, 'ack', [
                'messageId' => $validated['messageId'],
                'status' => $validated['status'],
                'recipient_uuid' => $recipientUuid
            ], $senderUuid));
            return response()->json(['status' => 'ACK broadcast']);
        }

        // Determine sender and receiver for storage
        $senderId = $request->input('uuid') ?: 'device'; // Use device UUID as sender ID
        $receiverId = $request->user() ? 'admin' : 'admin'; // In this context, device posts to admin (admin as receiver)
        $senderName = 'Device';
        if ($device = ContrackerDevice::where('uuid', $deviceUuid)->first()) {
            $senderName = $device->name ?: 'Device';
        }

        // Broadcast DeviceMessage event to admin listeners
        broadcast(new DeviceMessage($deviceUuid, $text, $senderName, $validated['messageId'] ?? null, $senderUuid, $recipientUuid));

        // Store the message in the database for history/search (as not read yet by admin)
        \Illuminate\Support\Facades\DB::table('contracker_messages')->insert([
            'conversation_id' => $deviceUuid,
            'sender_id' => $senderUuid,
            'receiver_id' => $recipientUuid,
            'message' => $text,
            'created_at' => now(),
            'updated_at' => now(),
            'read_at' => null           // admin has not read it at send time
        ]);

        return response()->json(['status' => 'Message sent']);
    }

    public function history(Request $request, $uuid)
    {
        // Fetch recent messages for a given device UUID (conversation)
        $query = \Illuminate\Support\Facades\DB::table('contracker_messages')
                    ->where('conversation_id', $uuid)
                    ->orderBy('created_at', 'asc');
        // If a "before" query param is provided, use it to paginate (fetch messages before a given ID or timestamp)
        if ($request->query('before')) {
            // Assuming 'before' is a message ID
            $query->where('id', '<', $request->query('before'));
        }
        // Limit to 50 messages for performance (pagination can be implemented by repeated calls with before)
        $messages = $query->limit(50)->get();
        return response()->json(['messages' => $messages]);
    }

    public function search(Request $request, $uuid)
    {
        $term = $request->validate(['q' => 'required|string'])['q'];
        // Search messages in this conversation for the term (case-insensitive)
        $results = \Illuminate\Support\Facades\DB::table('contracker_messages')
                    ->where('conversation_id', $uuid)
                    ->where('message', 'LIKE', '%' . $term . '%')
                    ->orderBy('created_at', 'asc')
                    ->get();
        return response()->json(['results' => $results]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'uuid' => 'required|string'  // conversation/device id
        ]);
        $deviceUuid = $validated['uuid'];
        $newText = $validated['message'];

        try {
            // Update message in database
            \Illuminate\Support\Facades\DB::table('contracker_messages')
                ->where('id', $id)
                ->update(['message' => $newText, 'updated_at' => now()]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Update failed'], 500);
        }

        // Broadcast an update event to both sides
        broadcast(new DeviceCommand($deviceUuid, 'edit', [
            'messageId' => $id,
            'newText' => $newText
        ]));
        return response()->json(['status' => 'Message updated']);
    }

    public function destroy(Request $request, $id)
    {
        // Find the message and determine conversation/device
        $message = \Illuminate\Support\Facades\DB::table('contracker_messages')->where('id', $id)->first();
        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }
        $deviceUuid = $message->conversation_id;

        try {
            \Illuminate\Support\Facades\DB::table('contracker_messages')->where('id', $id)->delete();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Delete failed'], 500);
        }

        // Broadcast a deletion event
        broadcast(new DeviceCommand($deviceUuid, 'delete', ['messageId' => $id]));
        return response()->json(['status' => 'Message deleted']);
    }
}
