<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Web Routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Fallback route for SPA
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::get('/jobs', function () {
    return Inertia::render('Jobs');  
});

Route::get('/geofence/{jobId}', function ($jobId) {
    return Inertia::render('Geofence', ['jobId' => $jobId]);
})->name('geofence');



Route::get('/geofence/{jobId}', function ($jobId) {
    return Inertia::render('Geofence', ['jobId' => $jobId]);
})->name('geofence');


Route::get('/devices', [SessionController::class, 'listDevices'])->name('devices.list');

Route::post('/devices/send-message', [MessageController::class, 'send'])->name('devices.message.send');


// Session management routes
Route::middleware('web')->group(function () {

    Route::post('/session/register-device', [SessionController::class, 'registerDevice'])->name('session.registerDevice');
    Route::get('/session/device/{uuid}', [SessionController::class, 'getDevice'])->name('session.getDevice');
    Route::get('/session/device-diff/{uuid}', [SessionController::class, 'getDeviceDiff'])->name('session.getDeviceDiff');
    Route::get('/session/current', [SessionController::class, 'session.current']);
    Route::post('/session/store', [SessionController::class, 'store']);
    Route::get('/session/get', [SessionController::class, 'get']);
    Route::post('/session/destroy', [SessionController::class, 'destroy']);
    Route::post('/session/device/{uuid}/updateDeviceName', [SessionController::class, 'updateDeviceName'])->name('session.device.updateDeviceName');
    Route::post('/session/device/ping', function (\Illuminate\Http\Request $request) {
        $uuid = $request->input('uuid');
        
        if (!$uuid) return response()->json(['error' => 'UUID is required'], 422);
        
        \App\Models\ContrackerDevice::where('uuid', $uuid)->update(['last_seen' => now()]);
        
        return response()->json(['status' => 'pinged']);
    })->name('session.device.ping');

    Route::get('/session/deviceip', function () {
        try {
            $ip = file_get_contents('https://api.ipify.org');
            return response()->json(['ip' => $ip]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to fetch IP'], 500);
        }
    })->name('session.device.ip');


    Route::get('/session/jobs', [SessionController::class, 'getJobs'])->name('session.getJobs');
    Route::get('/session/job-location/{jobId}', [SessionController::class, 'getJobLocation'])->name('session.getJobLocation');
    Route::post('/session/save-geofence', [SessionController::class, 'saveGeofence'])->name('session.saveGeofence');

    // Profile management routes
    Route::middleware('auth')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

});

require __DIR__.'/auth.php';
