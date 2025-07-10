<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contracker_messages';

    // Use UUID (string) as primary key instead of auto-incrementing integer
    protected $keyType = 'string';
    public $incrementing = false;

    // (Optional) If using a custom primary key field name, specify it:
    // protected $primaryKey = 'id'; // not needed here since 'id' is default

    // Allow mass assignment on these fields
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'status',
        'read_at',
    ];
}
