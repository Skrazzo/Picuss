<?php

use App\Http\Controllers\PictureController;
use App\Http\Controllers\ShareImagesController;
use App\Http\Controllers\ShareTagsController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// display login and register page
Route::get('/auth', function () { return Inertia::render('Auth', ['title' => 'Login']); })->name('login');

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
        
        Route::prefix('/image')->group(function () {
            Route::get('/{picture:public_id}', 'get_image')->name('get.image'); // Get image
            Route::get('/resized/{page}', 'get_resized_images')->name('get.resized.images'); // Get resized image array for the whole page
            // Moved outside of auth middleware
            Route::get('/thumb/{picture:public_id}', 'get_thumbnail')->name('get.thumb.image'); // get thumbnail
            Route::get('/half/{picture:public_id}', 'get_half_picture')->name('get.half.image'); // get scaled down image
            Route::delete('/delete/{picture:public_id}', 'delete_picture')->name('delete.picture');

            Route::put('/tags/{picture:public_id}', 'edit_tags')->name('edit.tags');
        });
    });

    Route::prefix('/tags')->group(function () {
        Route::controller(TagsController::class)->group(function () {
            Route::get('/', 'index')->name('tags.index'); // Render manage tags page
            Route::get('/get', 'get')->name('tags.get'); // Get all user tags in api format
            Route::post('/', 'create')->name('tags.create'); // Api POST call to create a new tag
            Route::put('/name/{tag:id}', 'editName')->name('tags.editName'); // Edit tag name
            Route::delete('/', 'deleteTags')->name('tags.delete'); // Route for deleting tags

        });
        
        Route::controller(ShareTagsController::class)->group(function () {
            Route::post('/share', 'shareTags')->name('tags.share'); // Sharing tags
            Route::delete('/share', 'unshareTags')->name('tags.share.remove');
        });
    });

    
});

Route::get('/image/meta/{image}', [PictureController::class, 'get_meta_image'])->name('get.meta.image'); // get image for meta tag
// Route::get('/image/thumb/{picture:public_id}', [PictureController::class, 'get_thumbnail'])->name('get.thumb.image'); // get thumbnail

// Shared images routes
Route::prefix('/s')->group(function () { 
    Route::controller(ShareImagesController::class)->group(function () {
        Route::get('/{picture:public_id}', 'view')->name('share.image.page');
        Route::get('/{picture:public_id}/get', 'get')->name('share.get.image');
        Route::get('/{picture:public_id}/download', 'download')->name('share.download.image');


        // Routes with password
        Route::middleware('auth')->group(function () {
            Route::get('/', 'manage_index')->name('share.links.manage');
            Route::delete('/delete', 'delete')->name('share.links.delete');

            Route::post('/create', 'create')->name('share.image.create');
        });
    });

    Route::controller(ShareTagsController::class)->group(function () {
        Route::get('/t/{sharetags:tag_public_id}', 'view')->name('share.tag.page');
    });
});
