<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;


class ContrackerDevice extends Model
{
    // table name: constracker_devices
    protected $table = 'contracker_devices';

    protected $fillable = [
        'uuid',
        'latitude',
        'longitude',
        'accuracy',
    ];

    public $timestamps = true; // Enable timestamps if needed
    protected $primaryKey = 'id'; //
    protected $keyType = 'int'; // Primary key type
    public $incrementing = true; // Use auto-incrementing primary key
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'accuracy' => 'float',
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


}
