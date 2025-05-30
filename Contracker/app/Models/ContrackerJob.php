<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContrackerJob extends Model
{
    protected $table = 'contracker_jobs';

    protected $fillable = [
        'job_no', 'description', 'address_1', 'address_2', 'address_3',
        'city', 'state', 'zip', 'contract_id', 'client_id', 'project_class_no', 'project_manager_id'
    ];


    
    public function locations()
    {
        return $this->hasMany(ContrackerJobLocation::class, 'job_id');
    }

}
