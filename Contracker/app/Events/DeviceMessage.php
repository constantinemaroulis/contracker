<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $uuid;
    public $message;

    public function __construct($uuid, $message)
    {
        $this->uuid = $uuid;
        $this->message = $message;
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('device.' . $this->uuid);
    }

    public function broadcastAs(): string
    {
        return 'DeviceMessage';
    }
}
