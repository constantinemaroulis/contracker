<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerCostCodeAssignment extends Model
{
    protected $table = 'contracker_cost_code_assignments';

    protected $fillable = [
        'job_id',
        'timecard_id',
        'laborer_id',
        'cost_code_id',
        'hours',
        'note',
    ];

    public function job()
    {
        return $this->belongsTo(ContrackerJob::class, 'job_id');
    }

    public function laborer()
    {
        return $this->belongsTo(ContrackerLaborer::class, 'laborer_id');
    }

    public function costCode()
    {
        return $this->belongsTo(ContrackerCostCode::class, 'cost_code_id');
    }

    public function timecard()
    {
        // relation will be defined once ContrackerTimecard model exists
        return $this->belongsTo(ContrackerTimecard::class, 'timecard_id');
    }
}
