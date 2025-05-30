<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
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



// Session management routes
Route::middleware('web')->group(function () {

    Route::post('/session/register-device', [SessionController::class, 'registerDevice'])->name('session.registerDevice');
    Route::get('/session/device/{uuid}', [SessionController::class, 'getDevice'])->name('session.getDevice');
    Route::get('/session/device-diff/{uuid}', [SessionController::class, 'getDeviceDiff'])->name('session.getDeviceDiff');
    Route::get('/session/current', [SessionController::class, 'session.current']);
    Route::post('/session/store', [SessionController::class, 'store']);
    Route::get('/session/get', [SessionController::class, 'get']);
    Route::post('/session/destroy', [SessionController::class, 'destroy']);

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
