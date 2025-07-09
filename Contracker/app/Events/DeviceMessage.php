<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue; // 1. Import this
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// 2. Implement ShouldQueue
class DeviceMessage implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * 3. Force this broadcast to run synchronously.
     *
     * @var string
     */
    public $connection = 'sync';
    public $queue = 'broadcasts';

    public $uuid;
    public $message;
    public $senderName;
    public $messageId; // Add an ID property to broadcast

    public function __construct($uuid, $message, $senderName, $messageId = null)
    {
        $this->uuid = $uuid;
        $this->message = $message;
        $this->senderName = $senderName;
        $this->messageId = $messageId;
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
