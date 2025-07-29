<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeEntry extends Model
{
    protected $fillable = [
        'device_id',
        'job_id',
        'start_time',
        'end_time',
        'face_in',
        'signature_in',
        'face_out',
        'signature_out',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(ContrackerDevice::class, 'device_id');
    }

    public function job()
    {
        return $this->belongsTo(ContrackerJob::class, 'job_id');
    }
}
