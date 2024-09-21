<?php

use App\Http\Controllers\HiddenPinController;
use App\Http\Controllers\PictureController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShareImagesController;
use App\Http\Controllers\ShareTagsController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// display login and register page
Route::get("/auth", function () {
    return Inertia::render("Auth", ["title" => "Login"]);
})->name("login");

// api routes for auth
Route::post("/login", [UserController::class, "login"])->name("post.login");
Route::post("/register", [UserController::class, "register"])->name("post.register");
Route::get("/logout", [UserController::class, "logout"])->name("logout");

Route::middleware("auth")->group(function () {
    Route::get("/user/info", [UserController::class, "get_modal_info"])->name("user.modal.info"); // Api request to get user information

    Route::controller(PictureController::class)->group(function () {
        Route::prefix("/upload")->group(function () {
            Route::get("/", "upload_index")->name("upload.index"); // Render upload page
            Route::post("/", "upload")->name("upload.post"); // Upload image zip
        });

        Route::get("/", "dashboard_index")->name("dashboard"); // display main page

        Route::prefix("/image")->group(function () {
            Route::get("/{picture:public_id}", "get_image")->name("get.image"); // Get image
            Route::get("/download/{picture:public_id}", "download_image")->name("download.image");
            Route::get("/resized/{page}", "get_resized_images")->name("get.resized.images"); // Get resized image array for the whole page
            // Moved outside of auth middlewa   re
            Route::get("/thumb/{picture:public_id}", "get_thumbnail")->name("get.thumb.image"); // get thumbnail
            Route::get("/half/{picture:public_id}", "get_half_picture")->name("get.half.image"); // get scaled down image
            Route::delete("/delete/{picture:public_id}", "delete_picture")->name("delete.picture");

            Route::put("/tags/{picture:public_id}", "edit_tags")->name("edit.tags");
        });
        Route::delete("/delete/images", "delete_pictures")->name("delete.pictures"); // Delete multiple pictures
    });

    Route::prefix("/tags")->group(function () {
        Route::controller(TagsController::class)->group(function () {
            Route::get("/", "index")->name("tags.index"); // Render manage tags page
            Route::get("/get", "get")->name("tags.get"); // Api Get all user tags in api format
            Route::post("/", "create")->name("tags.create"); // Api POST call to create a new tag
            Route::put("/name/{tag:id}", "editName")->name("tags.editName"); // Edit tag name
            Route::delete("/", "deleteTags")->name("tags.delete"); // Route for deleting tags
            Route::get("/images/get/{option}", "getImagesTags")->name("tags.images.get"); // Get tags of given images
            Route::post("/images/set", "setImagesTags")->name("tags.images.set"); // Set multiple tags for multiple images
            Route::delete("/images/remove", "removeImagesTags")->name("tags.images.remove"); // Remove multiple tags for multiple pictures
            Route::delete("/softDelete", "softDeleteTag")->name("tags.softDelete"); // Delete tag without deleting it's picturess
            Route::get("/hidden", "hidden_get_tags")->name("hidden.get.tags"); // Get tags of hidden images
        });

        Route::controller(ShareTagsController::class)->group(function () {
            Route::post("/share", "shareTags")->name("tags.share"); // Sharing tags
            Route::delete("/share", "unshareTags")->name("tags.share.remove");
            Route::post("/share/images", "shareImages")->name("tags.share.images"); // Create shared tag, add it to multiple images
        });
    });

    Route::prefix("/settings")->group(function () {
        Route::controller(SettingsController::class)->group(function () {
            Route::get("/", "index")->name("settings.index");
            Route::get("/stats", "get_stats")->name("settings.get.stats");
            Route::put("/password", "change_password")->name("password.update");
            Route::delete("/delete", "delete_account")->name("delete.account");
        });
    });

    // TODO: Finish hidden routes
    Route::prefix("/hidden")->group(function () {
        Route::controller(HiddenPinController::class)->group(function () {
            Route::get("/", "index")->name("hidden.index");
            Route::post("/auth", "auth")->name("hidden.auth"); // Create session for decrypting hidden images
            Route::post("/hide", "hide")->name("hide.pictures"); // Hide pictures and encrypt pictures
            Route::get("/info", "info")->name("hidden.info"); // Get user info about his hidden pictures

            // All routes related to images
            Route::prefix("/image")->group(function () {
                Route::get("/resized/{page}", "get_resized_images")->name("get.hidden.resized.images");
                Route::get("/half/{picture:public_id}", "get_half_picture")->name("get.hidden.half.image");
                Route::get("/full/{picture:public_id}", "get_full_picture")->name("get.hidden.full.image");
            });

            // Route::get("/get", "get")->name("hidden.get");
            // Route::delete("/", "delete")->name("hidden.delete");
        });
    });
});

Route::get("/image/meta/{image}", [PictureController::class, "get_meta_image"])->name("get.meta.image"); // get image for meta tag
// Route::get('/image/thumb/{picture:public_id}', [PictureController::class, 'get_thumbnail'])->name('get.thumb.image'); // get thumbnail

// Shared images routes
Route::prefix("/s")->group(function () {
    Route::controller(ShareImagesController::class)->group(function () {
        Route::get("/{picture:public_id}", "view")->name("share.image.page");
        Route::get("/{picture:public_id}/get", "get")->name("share.get.image");
        Route::get("/half/{picture:public_id}", "get_half")->name("share.get.half");
        Route::get("/{picture:public_id}/download", "download")->name("share.download.image");

        // Routes with password
        Route::middleware("auth")->group(function () {
            Route::get("/", "manage_index")->name("share.links.manage");
            Route::delete("/delete", "delete")->name("share.links.delete");

            Route::post("/create", "create")->name("share.image.create");
        });
    });

    Route::controller(ShareTagsController::class)->group(function () {
        Route::prefix("/t")->group(function () {
            Route::get("/{tag:tag_public_id}", "view")->name("share.tag.page"); // Index view
            Route::get("/full/{picture:public_id}", "get_full_image")->name("share.tags.get.picture"); // get full size image
            Route::get("/download/{tag}", "download")->name("share.tag.download"); // Download all images belonging to a tag
            Route::get("/{tag:tag_public_id}/{page}", "get")->name("share.tags.api"); // Get shared tag pictures in api format
        });
    });
});
