<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Welcome Page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/devices', [SessionController::class, 'listDevices'])->name('devices.list');

// Authenticated User Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Devices Page
    Route::get('/devices', [SessionController::class, 'listDevices'])->name('devices.list');

    // Jobs and Geofence Pages
    Route::get('/jobs', function () {
        return Inertia::render('Jobs');
    })->name('jobs.list');
    Route::get('/geofence/{jobId}', function ($jobId) {
        return Inertia::render('Geofence', ['jobId' => $jobId]);
    })->name('geofence');

    // Chat Command Route
    // Route::post('/session/device/{uuid}/command', [SessionController::class, 'sendDeviceCommand'])->name('session.device.command');
});

// ... inside your routes/web.php

/*
|--------------------------------------------------------------------------
| Device-Facing & Other API Routes
|--------------------------------------------------------------------------
*/

// Handles messages sent FROM a device TO the dashboard
Route::post('/devices/send-message', [MessageController::class, 'send'])->name('devices.message.send');
Route::post('/session/device/command/{uuid}', [SessionController::class, 'sendDeviceCommand'])
    ->name('session.device.command');
<<<<<<< Updated upstream
    Route::get('/session/device/ip', [SessionController::class, 'getDeviceIp'])->name('session.device.ip');
=======
>>>>>>> Stashed changes

Route::middleware('web')->group(function () {
    // Device Registration & Data
    Route::post('/session/register-device', [SessionController::class, 'registerDevice'])->name('session.registerDevice');
    Route::get('/session/device/{uuid}', [SessionController::class, 'getDevice'])->name('session.getDevice');
    Route::get('/session/device-diff/{uuid}', [SessionController::class, 'getDeviceDiff'])->name('session.getDeviceDiff');
    Route::post('/session/device/updateDeviceName/{uuid}', [SessionController::class, 'updateDeviceName'])->name('session.device.updateDeviceName');

    // Device Heartbeat
    Route::post('/session/device/ping', function (\Illuminate\Http\Request $request) {
        if ($uuid = $request->input('uuid')) {
            \App\Models\ContrackerDevice::where('uuid', $uuid)->update(['last_seen' => now()]);
            return response()->json(['status' => 'pinged']);
        }
        return response()->json(['error' => 'UUID is required'], 422);
    })->name('session.device.ping');

    // Other Session/Job routes

    

    Route::get('/session/jobs', [SessionController::class, 'getJobs'])->name('session.getJobs');
    Route::get('/session/job-location/{jobId}', [SessionController::class, 'getJobLocation'])->name('session.getJobLocation');
    Route::post('/session/save-geofence', [SessionController::class, 'saveGeofence'])->name('session.saveGeofence');



});


// Authentication Routes
require __DIR__.'/auth.php';
