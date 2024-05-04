<?php

use App\Http\Controllers\PictureController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/auth', function () { return Inertia::render('Auth'); })->name('login');
Route::get('/register', function () { return Inertia::render('Register'); })->name('register');

Route::post('/login', [UserController::class, 'login'])->name('post.login');
Route::post('/register', [UserController::class, 'register'])->name('post.register');
Route::get('/logout', [UserController::class, 'logout'])->name('logout');


Route::middleware('auth')->group(function () {
    Route::get('/', function () { return Inertia::render('Dashboard'); })->name('dashboard');
    Route::get('/user/info', [UserController::class, 'get_modal_info'])->name('user.modal.info');

    Route::prefix('/upload')->group(function () {
        Route::get('/', [PictureController::class, 'index'])->name('upload.index');

    });

    Route::prefix('/tags')->group(function () {
        Route::get('/', [TagsController::class, 'index'])->name('tags.index');
        Route::post('/', [TagsController::class, 'create'])->name('tags.create');
    });
});
