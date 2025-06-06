<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceCommand implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $uuid;
    public $command;
    public $payload;
    /**
     * Create a new event instance.
     */
    public function __construct($uuid, $command, $payload = [])
    {
        $this->uuid = $uuid;
        $this->command = $command;
        $this->payload = $payload;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('device.' . $this->uuid),
        ];
    }

    public function broadcastAs()
    {
        return 'DeviceCommand';
    }
}
