<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RemoteControlController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('RemoteControl', [
            'auth' => ['user' => $request->user()],
        ]);
    }
}
