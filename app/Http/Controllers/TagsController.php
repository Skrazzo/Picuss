<?php

namespace App\Http\Controllers;

use App\Models\Tags;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class TagsController extends Controller
{
    /**
     * Renders the tags management page using the Inertia library.
     *
     * @param Request $request The HTTP request object.
     * @return \Inertia\Response The Inertia response.
     */
    public function index(Request $req)
    {
        $tags = $req
            ->user()
            ->tag()
            ->orderBy("created_at", "DESC")
            ->get()
            ->map(function ($tag, $idx) {
                // Search json for the tag id
                // It shows an error, but trust me bro, it works
                $pictureCount = auth()
                    ->user()
                    ->picture()
                    ->whereJsonContains("tags", $tag["id"])
                    ->count();

                $shared = $tag->share()->first();
                return [
                    "name" => $tag["name"],
                    "id" => $tag["id"],
                    "pictureCount" => $pictureCount,
                    "shared" => $shared ? true : false,
                    "public_id" => $shared ? $shared->tag_public_id : null,
                ];
            });

        return Inertia::render("ManageTags", ["tags" => $tags, "title" => "Manage tags"]);
    }

    /**
     * Retrieves the tags associated with the authenticated user.
     *
     * @param Request $request The HTTP request object.
     * @return \Illuminate\Http\JsonResponse The JSON response containing the tags.
     */
    public function get(Request $request)
    {
        // Get only needed info from the database, and sort it
        $tags = $request
            ->user()
            ->tag()
            ->orderBy("name", "ASC")
            ->get()
            ->map(function ($tag) {
                // Search json for the tag id
                // It shows an error, but trust me bro, it works
                $pictureCount = auth()
                    ->user()
                    ->picture()
                    ->whereJsonContains("tags", $tag["id"])
                    ->count();

                $shared = $tag->share()->first();
                return [
                    "name" => $tag["name"],
                    "id" => $tag["id"],
                    "pictureCount" => $pictureCount,
                    "shared" => $shared ? true : false,
                    "public_id" => $shared ? $shared->tag_public_id : null,
                ];
            });

        return response()->json($tags);
    }

    /**
     * Creates a new tag.
     *
     * @param Request $request The HTTP request object.
     * @return \Illuminate\Http\RedirectResponse The redirect response.
     */
    public function create(Request $request)
    {
        $data = $request->validate([
            "name" => "required|max:20",
        ]);

        $data["name"] = strtolower($data["name"]); // all tags should be saved in lowercase

        $user = $request->user();
        $tag = $user
            ->tag()
            ->where("name", $data["name"])
            ->first();

        if ($tag) {
            return back()->withErrors([
                "name" => "Tag already exists!",
            ]);
        }

        $user->tag()->create($data);

        $tags = $request
            ->user()
            ->tag()
            ->orderBy("created_at", "DESC")
            ->get()
            ->map(function ($tag, $idx) {
                // Search json for the tag id
                // It shows an error, but trust me bro, it works
                $pictureCount = auth()
                    ->user()
                    ->picture()
                    ->whereJsonContains("tags", $tag["id"])
                    ->count();

                $shared = $tag->share()->first();
                return [
                    "name" => $tag["name"],
                    "id" => $tag["id"],
                    "pictureCount" => $pictureCount,
                    "shared" => $shared ? true : false,
                    "public_id" => $shared ? $shared->tag_public_id : null,
                ];
            });
        return back()->with("tags", $tags);
    }

    function editName(Tags $tag, Request $req)
    {
        $data = $req->validate([
            // validate tag name
            "name" => "required|max:20",
        ]);

        if ($tag->user_id !== $req->user()->id) {
            // check if user is the owner of the tag
            return response()->json(["message" => "This is not your tag ..."], 403);
        }

        $tag->name = strtolower($data["name"]); // All tags are lowercased
        if ($tag->save()) {
            // Get only needed info from the database, and sort it
            $tags = $req
                ->user()
                ->tag()
                ->orderBy("name", "ASC")
                ->get()
                ->map(function ($tag, $idx) {
                    // Search json for the tag id
                    // It shows an error, but trust me bro, it works
                    $pictureCount = auth()
                        ->user()
                        ->picture()
                        ->whereJsonContains("tags", $tag["id"])
                        ->count();

                    $shared = $tag->share()->first();
                    return [
                        "name" => $tag["name"],
                        "id" => $tag["id"],
                        "pictureCount" => $pictureCount,
                        "shared" => $shared ? true : false,
                        "public_id" => $shared ? $shared->tag_public_id : null,
                    ];
                });

            return response()->json([
                "message" => "Successfully changed tag name",
                "tags" => $tags,
            ]);
        }
        // This error should not happen unless database failes to save the record
        return response()->json(
            ["message" => "It seems that database did not save new name", "tags" => []],
            500
        );
    }

    public function deleteTags(Request $req)
    {
        $data = $req->validate([
            "tags" => "required|array",
        ]);

        $user = $req->user();
        $SERVER_IMAGE_DISK = env("SERVER_IMAGE_DISK", "images");

        $SERVER_THUMBNAILS_DISK = env('$SERVER_THUMBNAILS_DISK', "thumbnails");
        $thumbDisk = Storage::disk($SERVER_THUMBNAILS_DISK);

        $SERVER_IMAGE_HALF_DISK = env("SERVER_IMAGE_HALF_DISK", "half_images");
        $halfImagesDisk = Storage::disk($SERVER_IMAGE_HALF_DISK);

        // Go through every id, delete tag and pictures that belong to those tags
        foreach ($data["tags"] as $tagId) {
            $pictures = $user->picture()->whereJsonContains("tags", $tagId)->get();
            foreach ($pictures as $pic) {
                // Delete picture from storage, and then if success delete it from database
                $imgPath = Storage::disk($SERVER_IMAGE_DISK)->path($pic->image);
                if (!unlink($imgPath)) {
                    return response()->json(
                        ["message" => "We could not delete one of your pictures, please try again"],
                        500
                    );
                }

                // delete thumbnail
                if (!$thumbDisk->delete($pic->image)) {
                    return response()->json(
                        ["message" => "We could not delete one of your pictures, please try again"],
                        500
                    );
                }

                // delete half image
                if (!$halfImagesDisk->delete($pic->image)) {
                    return response()->json(
                        ["message" => "We could not delete one of your pictures, please try again"],
                        500
                    );
                }

                // Delete record from database
                if (!$pic->delete()) {
                    return response()->json(
                        [
                            "message" =>
                                "We could not delete picture from our database, please try again",
                        ],
                        500
                    );
                }
            }

            $tag = $user->tag()->find($tagId);
            if (!$tag->delete()) {
                return response()->json(
                    ["message" => "We could not delete tag from our database, please try again"],
                    500
                );
            }
        }

        // Get only needed info from the database, and sort it
        $tags = $req
            ->user()
            ->tag()
            ->orderBy("name", "ASC")
            ->get()
            ->map(function ($tag, $idx) {
                // Search json for the tag id
                // It shows an error, but trust me bro, it works
                $pictureCount = auth()
                    ->user()
                    ->picture()
                    ->whereJsonContains("tags", $tag["id"])
                    ->count();

                $shared = $tag->share()->first();
                return [
                    "name" => $tag["name"],
                    "id" => $tag["id"],
                    "pictureCount" => $pictureCount,
                    "shared" => $shared ? true : false,
                    "public_id" => $shared ? $shared->tag_public_id : null,
                ];
            });

        return response()->json(["message" => "Successfully deleted tags", "tags" => $tags]);
    }

    public function getImagesTags(Request $req, $option)
    {
        $validator = Validator::make($req->all(), [
            "imageIds" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        $data = $validator->valid(); // validated data
        $user = auth()->user();

        $tags = $user->tag()->pluck("id");
        $images = $user
            ->picture()
            ->whereIn("public_id", $data["imageIds"])
            ->get();

        // $option 1 means get tags that selected picture do not have
        // $option 2 meas get tags, that are in the selected pictures
        $rtnIds = [];

        // Go through every image, and check what tags they do not have
        /*
                1. Loop through tags array on each image
                2. Check if tag is in the image
                    2.1 If tag isnt in the image
                        Check if tag isn't in $rtnIds -> if not in array add it to array
            */

        foreach ($images as $img) {
            foreach ($tags as $tag) {
                // Check if tag is in the image
                // If tag isn't in the image, check if tag isn't in $rtnIds
                if (
                    in_array($tag, $img->tags) == (intval($option) == 1)
                        ? false
                        : true && !in_array($tag, $rtnIds)
                ) {
                    // If not in array, add it to array
                    $rtnIds[] = $tag;
                }
            }
        }

        $rtnTags = $user->tag()->select("id", "name")->whereIn("id", $rtnIds)->get();
        return $rtnTags;
    }
}
