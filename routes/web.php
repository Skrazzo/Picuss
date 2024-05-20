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
    
    Route::get('/user/info', [UserController::class, 'get_modal_info'])->name('user.modal.info'); // Api request to get user information

    Route::controller(PictureController::class)->group(function () {
        Route::prefix('/upload')->group(function () {
            Route::get('/', 'upload_index')->name('upload.index'); // Render upload page
            Route::post('/', 'upload')->name('upload.post'); // Upload image zip
        });

        Route::get('/', 'dashboard_index')->name('dashboard'); // display main page
        Route::get('/image/{picture:public_id}', 'get_image')->name('get.image'); // Get image
        Route::get('/image/resized/{page}', 'get_resized_images')->name('get.resized.images'); // Get resized image array for the whole page
    });

    Route::prefix('/tags')->group(function () {
        Route::controller(TagsController::class)->group(function () {
            Route::get('/', 'index')->name('tags.index'); // Render manage tags page
            Route::get('/get', 'get')->name('tags.get'); // Get all user tags in api format
            Route::post('/', 'create')->name('tags.create'); // Api POST call to create a new tag
            Route::put('/name/{tag:id}', 'editName')->name('tags.editName'); // Edit tag name
            Route::delete('/', 'deleteTags')->name('tags.delete'); // Route for deleting tags
        });
    });
});
