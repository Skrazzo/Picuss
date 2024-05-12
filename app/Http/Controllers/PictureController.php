<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZanySoft\Zip\Zip;

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
        $tmpZipFile = '';

        if ($req->file('zip')->isValid()) {
            $file = $req->file('zip');
            $tmpZipFile = Storage::disk($SERVER_TMP_ZIP_DISK)->put('', $file);
        }else{
            return response()->json([ 'message' => 'File is not valid' ], 400);
        }

        // Open zip containing all compressed images and read all of its contents
        $zipPath = Storage::disk($SERVER_TMP_ZIP_DISK)->get($tmpZipFile);
        if (!Zip::check($zipPath)) {
            return response()->json([ 'message' => 'Zip file is not valid' ], 400);
        }
        
        $zip = Zip::open($zipPath);
        

        

        return response()->json($zip->listFiles());


        return response()->json($data);
    }
}
