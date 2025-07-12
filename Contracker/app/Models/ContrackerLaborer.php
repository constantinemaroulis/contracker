<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerLaborer extends Model
{
    protected $table = 'contracker_laborers';

    protected $fillable = [
        'job_id',
        'name',
        'local',
        'original_hours',
        'clock_in_time',
        'clock_out_time',
    ];

    public function job()
    {
        return $this->belongsTo(ContrackerJob::class, 'job_id');
    }

    public function assignments()
    {
        return $this->hasMany(ContrackerCostCodeAssignment::class, 'laborer_id');
    }
}
