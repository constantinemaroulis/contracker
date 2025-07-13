<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerCostCode extends Model
{
    protected $table = 'contracker_cost_codes';

    protected $fillable = [
        'job_id',
        'code',
        'name',
        'description',
    ];

    public function job()
    {
        return $this->belongsTo(ContrackerJob::class, 'job_id');
    }

    public function assignments()
    {
        return $this->hasMany(ContrackerCostCodeAssignment::class, 'cost_code_id');
    }
}
