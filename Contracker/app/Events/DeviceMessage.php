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
<<<<<<< HEAD
    public $messageId; // Add an ID property to broadcast
    public $senderUuid;
    public $recipientUuid;

    public function __construct($uuid, $message, $senderName, $messageId = null, $senderUuid = null, $recipientUuid = null)
=======

    public function __construct($uuid, $message, $senderName)
>>>>>>> parent of 40c4ad1 (Better chat)
    {
        $this->uuid = $uuid;
        $this->message = $message;
        $this->senderName = $senderName;
<<<<<<< HEAD
        $this->messageId = $messageId;
        $this->senderUuid = $senderUuid;
        $this->recipientUuid = $recipientUuid;
=======
>>>>>>> parent of 40c4ad1 (Better chat)
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