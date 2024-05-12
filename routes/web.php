<?php

use App\Http\Controllers\PictureController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// display login and register page
Route::get('/auth', function () { return Inertia::render('Auth'); })->name('login');

// api routes for auth
Route::post('/login', [UserController::class, 'login'])->name('post.login');
Route::post('/register', [UserController::class, 'register'])->name('post.register');
Route::get('/logout', [UserController::class, 'logout'])->name('logout');


Route::middleware('auth')->group(function () {
    Route::get('/', function () { return Inertia::render('Dashboard'); })->name('dashboard'); // display main page
    Route::get('/user/info', [UserController::class, 'get_modal_info'])->name('user.modal.info'); // Api request to get user information

    Route::prefix('/upload')->group(function () {
        Route::get('/', [PictureController::class, 'index'])->name('upload.index'); // Render upload page
        Route::post('/', [PictureController::class, 'upload'])->name('upload.post'); // Upload image zip
    });

    Route::prefix('/tags')->group(function () {
        Route::get('/', [TagsController::class, 'index'])->name('tags.index'); // Render manage tags page
        Route::get('/get', [TagsController::class, 'get'])->name('tags.get'); // Get all user tags in api format
        Route::post('/', [TagsController::class, 'create'])->name('tags.create'); // Api POST call to create a new tag
    });
});

Route::get('/zip', [PictureController::class, 'get_zip']);