<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RemoteAssistController extends Controller
{
    public function show(Request $request, $uuid)
    {
        return Inertia::render('RemoteAssist', [
            'auth' => ['user' => $request->user()],
            'uuid' => $uuid,
        ]);
    }
}
