<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerJobLocation extends Model
{
    protected $table = 'contracker_jobs_location';

    protected $fillable = [
        'job_id', 'latitude', 'longitude', 'geo_fence'
    ];



    public function job()
    {
        return $this->belongsTo(ContrackerJob::class, 'job_id');
    }

    public function devices()
    {
        return $this->hasMany(ContrackerDevice::class, 'job_id');
    }

    public function geofence()
    {
        return $this->hasOne(ContrackerJobGeofence::class, 'job_location_id');
    }

}
