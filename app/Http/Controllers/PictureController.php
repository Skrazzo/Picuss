<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;



class PictureController extends Controller
{
    public function index(Request $req){
        return Inertia::render('Upload');
    }

    public function upload(Request $req){
        $data = $req->validate([
            'zip' => 'required|file|mimes:zip',
            'tags' => 'required|json'
        ]);

        
        $SERVER_TMP_ZIP_DISK = env('SERVER_TMP_ZIP_DISK', 'tmp');

        if ($req->file('zip')->isValid()) {
            $file = $req->file('zip');
            $tmpFileName = Storage::disk($SERVER_TMP_ZIP_DISK)->put('', $file);
            return response()->json($tmpFileName);
        }

        return response()->json($data);
    }
}
