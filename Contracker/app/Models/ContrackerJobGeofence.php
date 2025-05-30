<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerJobGeofence extends Model
{
    protected $table = 'contracker_jobs_geofence';

    protected $fillable = [
        'job_location_id',
        'boundary_points'
    ];

    public function jobLocation()
    {
        return $this->belongsTo(ContrackerJobLocation::class, 'job_location_id');
    }

}
