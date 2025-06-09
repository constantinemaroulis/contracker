<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue; // Import this interface
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// By implementing ShouldQueue and setting the public $connection property to 'sync',
// we are explicitly telling Laravel: "Do NOT use the default database queue for this event.
// Execute the broadcast immediately, as part of the initial web request."
// This is the standard, foolproof way to ensure real-time events are not delayed.

class DeviceCommand implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The name of the queue connection to use for this job.
     *
     * @var string
     */
    public string $connection = 'sync';

    /**
     * The public properties that will be serialized and broadcast.
     */
    public $uuid;
    public string $command;
    public array $payload;
    public string $queue = 'broadcasts';

    /**
     * Create a new event instance.
     *
     * @param string $uuid
     * @param string $command
     * @param array $payload
     */
    public function __construct($uuid, $command, array $payload)
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

    /**
     * The name of the event to broadcast as.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'DeviceCommand';
    }
}