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

        


        return response()->json($data);
    }

    public function get_zip(){
        $SERVER_TMP_ZIP_DISK = env('SERVER_TMP_ZIP_DISK', 'tmp');
        $SERVER_IMAGE_DISK = env('SERVER_IMAGE_DISK', 'images');

        $tmpZipFile = 'wpVVlV1OlSMP1FPnt4odty42Vxx0MYrpmsaZ7RDG.zip';

        
        if (!Storage::disk($SERVER_TMP_ZIP_DISK)->exists($tmpZipFile)) {
            // This error really shouldn't appear, but im making it just in case
            dd('Temporary zip file does not exist!'); // Replace with proper response
        }

        $zipPath = Storage::disk($SERVER_TMP_ZIP_DISK)->path($tmpZipFile);

        $zip = new ZipArchive();
        $zipStatus = $zip->open($zipPath);

        // Check if zip has been opened properly
        if (!$zipStatus) {
            dd('Could not open zip file'); // replace with error response
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
            dd("Files exist in destination directory!"); // Replace with proper response
        }

        // Extract zip file
        $success = $zip->extractTo(Storage::disk($SERVER_IMAGE_DISK)->path(''));
        if (!$success) {
            dd("Files could not be extracted!");
        }
        
        // Delete zip file
        $deleted = Storage::disk($SERVER_TMP_ZIP_DISK)->delete($tmpZipFile);
        if (!$deleted) {
            dd("Could not delete temporary zip file!"); // Replace with proper response
        }


        // TODO: Add to the database
        dd('hello world');
    }
}
