<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class PictureController extends Controller
{
    public function index(Request $req){
        return Inertia::render('Upload');
    }

    public function upload(Request $req){
        $data = $req->validate([
            'zip' => 'required|file|mimes:zip|max:512000', // 500MB
            'tags' => 'required|json'
        ]);

        $SERVER_TMP_ZIP_DISK = env('SERVER_TMP_ZIP_DISK', 'tmp');
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');
        $tmpZipFile = '';

        if ($req->file('zip')->isValid()) {
            $file = $req->file('zip');
            $tmpZipFile = Storage::disk($SERVER_TMP_ZIP_DISK)->put('', $file);
        }else{
            return response()->json([ 'message' => 'File is not valid' ], 400);
        }

        // Check if zip file exists
        if (!Storage::disk($SERVER_TMP_ZIP_DISK)->exists($tmpZipFile)) {
            // This error really shouldn't appear, but im making it just in case
            return response()->json([ 'message' => 'Temporary zip file does not exist!'], 404);
        }

        // Open zip file
        $zipPath = Storage::disk($SERVER_TMP_ZIP_DISK)->path($tmpZipFile);

        $zip = new ZipArchive();
        $zipStatus = $zip->open($zipPath);

        // Check if zip has been opened properly
        if (!$zipStatus) {
            return response()->json([ 'message' => 'Could not open zip file'], 500);
        }

        // get all zip file contents
        $zipFiles = [];
        for ($i = 0; $i < $zip->count(); $i++){
            $zipFiles[] = $zip->getNameIndex($i);
        }

        $noOverwrite = true; // This variable determines if any files will get overwritten
        foreach ($zipFiles as $file) {
            if (Storage::disk($SERVER_IMAGE_DISK)->exists($file)) {
                $noOverwrite = false;
                break;
            }
        }

        // Check if any of zip files were found in the image directory
        if (!$noOverwrite) {
            return response()->json([ 'message' => "Files exist in destination directory!"], 409);
        }

        // Extract zip file
        $success = $zip->extractTo(Storage::disk($SERVER_IMAGE_DISK)->path(''));
        if (!$success) {
            return response()->json([ 'message' => "Files could not be extracted!" ], 500);
        }

        // close zip
        $zip->close();

        // Delete zip file
        $deleted = Storage::disk($SERVER_TMP_ZIP_DISK)->delete($tmpZipFile);
        if (!$deleted) {
            return response()->json([ 'message' => "Could not delete temporary zip file!"], 500);
        }

        // Check if all files are extracted successfully, and if they're then add to the database
        $allExtracted = true;
        foreach ($zipFiles as $file) {
            if (!Storage::disk($SERVER_IMAGE_DISK)->exists($file)) {
                $allExtracted = false;
                continue;
            }

            $id = $req->user()->picture()->create([
                'image' => $file,
                'tags' => $data['tags'] // tag ids
            ]);

            if (!$id) { // check if database record was created successfully
                return response()->json([ 'message' => 'Could not create a database record!' ], 500);
            }
        }

        if (!$allExtracted) {
            return response()->json([ 'message' => 'Not all files could be extracted successfully!'], 500);
        }

        return response()->json([ 'message' => 'All images were uploaded successfully' ], 201);
    }
}
