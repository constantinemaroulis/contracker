<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function store(Request $request)
    {
        $request->session()->put('key', $request->input('value'));
        return response()->json(['status' => 'stored']);
    }

    public function get(Request $request)
    {
        return response()->json(['value' => $request->session()->get('key')]);
    }

    public function destroy(Request $request)
    {
        $request->session()->forget('key');
        return response()->json(['status' => 'destroyed']);
    }
}
