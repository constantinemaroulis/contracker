<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;


class ContrackerDevice extends Model
{
    // table name: constracker_devices
    protected $table = 'contracker_devices';

    protected $fillable = [
        'uuid',
        'latitude',
        'longitude',
        'accuracy',
        'name',
        'device_type',
        'local_ip',
        'public_ip',
        'mac_address',
        'device_details',
    ];

    public $timestamps = true; // Enable timestamps if needed
    protected $primaryKey = 'id'; //
    protected $keyType = 'int'; // Primary key type
    public $incrementing = true; // Use auto-incrementing primary key
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'accuracy' => 'float',
        'last_seen' => 'datetime',
    ];

    protected $appends = [
        'job_no',
        'online',
        'last_ping',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function getDeviceIdAttribute() {
        return $this->uuid;
    }

    public static function findByUuid($uuid) {
        return Cache::remember("device_{$uuid}", now()->addMinutes(30), function () use ($uuid) {
            return self::where('uuid', $uuid)->first();
        });
    }

    public function jobLocation()
    {
        return $this->belongsTo(ContrackerJobLocation::class, 'job_id');
    }

    public function getJobNoAttribute()
    {
        return $this->jobLocation && $this->jobLocation->job
            ? $this->jobLocation->job->job_no
            : null;
    }

    /**
     * Scope for devices considered online based on the last_seen timestamp.
     */
    public function scopeOnline($query)
    {
        $threshold = config('contracker.online_threshold', 5);
        return $query->where('last_seen', '>=', now()->subMinutes($threshold));
    }

    /**
     * Determine if the device is currently online.
     */
    public function getOnlineAttribute(): bool
    {
        $threshold = config('contracker.online_threshold', 5);
        return (bool) ($this->last_seen && $this->last_seen->gt(now()->subMinutes($threshold)));
    }

    /**
     * Minutes since the device last pinged the server.
     */
    public function getLastPingAttribute(): ?int
    {
        return $this->last_seen ? $this->last_seen->diffInMinutes(now()) : null;
    }


}
