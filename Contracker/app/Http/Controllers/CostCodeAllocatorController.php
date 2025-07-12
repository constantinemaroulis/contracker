<?php

namespace App\Http\Controllers;

use App\Models\ContrackerJob;
use App\Models\ContrackerCostCode;
use App\Models\ContrackerLaborer;
use App\Models\ContrackerCostCodeAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CostCodeAllocatorController extends Controller
{
    public function index($jobId): Response
    {
        $job = ContrackerJob::findOrFail($jobId);
        return Inertia::render('CostCodeAllocator', [
            'jobId' => $job->id,
        ]);
    }

    public function data($jobId)
    {
        $job = ContrackerJob::findOrFail($jobId);
        $costCodes = ContrackerCostCode::where('job_id', $job->id)->get();
        $laborers = ContrackerLaborer::where('job_id', $job->id)->get();
        $assignments = ContrackerCostCodeAssignment::where('job_id', $job->id)->get();

        return response()->json([
            'costCodes' => $costCodes,
            'laborers' => $laborers,
            'assignments' => $assignments,
        ]);
    }
}
