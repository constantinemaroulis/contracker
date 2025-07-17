<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RemoteViewerController extends Controller
{
    public function index(Request $request)
    {
        $dir = public_path('screenshots');
        $images = [];
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                if (preg_match('/\.(png|jpe?g|gif)$/i', $file)) {
                    $images[] = '/screenshots/' . $file;
                }
            }
        }

        return Inertia::render('RemoteViewer', [
            'auth' => ['user' => $request->user()],
            'images' => $images,
        ]);
    }
}
