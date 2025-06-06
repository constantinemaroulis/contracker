<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('device.{uuid}', function ($user, $uuid) {
    return true;
});
