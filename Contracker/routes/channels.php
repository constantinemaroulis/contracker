<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// By removing the `$user` type-hint and always returning true, we allow
// any client (even non-authenticated ones) to subscribe to this channel.
// This is essential for your remote devices to receive messages.
Broadcast::channel('device.{uuid}', function ($user = null, $uuid) {
    Log::info("Broadcasting authorization attempt for device UUID: {$uuid}");

    // In a real production environment, you would add security here,
    // for example, checking if the UUID exists in your database.
    // For now, we allow any device to connect for debugging purposes.
    return true;
});