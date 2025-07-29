<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContrackerJob;
use App\Models\ContrackerCostCode;
use App\Models\ContrackerLaborer;
use App\Models\ContrackerCostCodeAssignment;

class ContrackerDemoSeeder extends Seeder
{
    public function run()
    {
        $job = ContrackerJob::create([
            'job_no' => 'OFF-001',
            'description' => 'Demo Office Build',
            'address_1' => '1 Demo Way',
            'city' => 'DemoCity',
            'state' => 'NY',
            'zip' => '10001',
            'contract_id' => 1,
            'client_id' => 1,
            'project_class_no' => 1,
            'project_manager_id' => 1,
        ]);

        $codes = [
            ['code' => 'S10001-001', 'name' => 'Carpentry'],
            ['code' => 'S10001-002', 'name' => 'Plumbing'],
            ['code' => 'S10001-003', 'name' => 'Electrical'],
        ];
        foreach ($codes as $c) {
            ContrackerCostCode::create(array_merge($c, ['job_id' => $job->id]));
        }

        $laborers = [
            ['name' => 'John Smith', 'local' => 'Local79'],
            ['name' => 'Jane Doe', 'local' => 'Local79'],
            ['name' => 'Bob Brown', 'local' => 'Local102'],
        ];
        foreach ($laborers as $l) {
            ContrackerLaborer::create([
                'job_id' => $job->id,
                'name' => $l['name'],
                'local' => $l['local'],
                'original_hours' => 10,
                'clock_in_time' => '07:00:00',
                'clock_out_time' => '17:00:00',
            ]);
        }

        // assignments optional demo
        $lab = ContrackerLaborer::first();
        $cc = ContrackerCostCode::first();
        ContrackerCostCodeAssignment::create([
            'job_id' => $job->id,
            'laborer_id' => $lab->id,
            'cost_code_id' => $cc->id,
            'hours' => 10,
        ]);
    }
}
