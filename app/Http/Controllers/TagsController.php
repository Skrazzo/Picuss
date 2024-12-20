<?php

namespace App\Http\Controllers;

use App\Helpers\TagsHelper;
use App\Helpers\ValidateApi;
use App\Models\Tags;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class TagsController extends Controller
{
    /**
     * This functions returns tags in array, sorted by created_at in desc order
     * with picture count, if shared, and some additional data
     * $orderBy -> array [by what, how] ex: [name, desc]
     */
    public function getTags(Request $req, $orderBy = ["created_at", "DESC"])
    {
        $tags = $req
            ->user()
            ->tag()
            ->orderBy($orderBy[0], $orderBy[1])
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
                    "softDelete" => TagsHelper::CanSoftDelete($tag["id"]),
                    "public_id" => $shared ? $shared->tag_public_id : null,
                ];
            });
        return $tags;
    }

    /**
     * Return all tags that belong to at least one picture, that is not hidden
     * This function returns array of tags, with the same structure as getTags
     * @param Request $req
     * @return array
     */
    public function getVisibleTags(Request $req)
    {
        $tags = $this->getTags($req, ["name", "ASC"]);

        // $filtered = array_filter($tags, function ($tag) {
        //     $hiddenPics = TagsHelper::OnlyHiddenPics($tag["id"]); // Return true if tag contains only hidden images
        //     return !$hiddenPics ? $tag : null;
        // });

        // Filter out tags that belong only to the hidden folder
        $filtered = [];
        foreach ($tags as $tag) {
            if (!TagsHelper::OnlyHiddenPics($tag["id"])) {
                $filtered[] = $tag;
            }
        }

        return $filtered;
    }

    /**
     * Renders the tags management page using the Inertia library.
     *
     * @param Request $request The HTTP request object.
     * @return \Inertia\Response The Inertia response.
     */
    public function index(Request $req)
    {
        return Inertia::render("ManageTags", [
            "tags" => $this->getTags($req),
            "title" => "Manage tags",
        ]);
    }

    /**
     * Retrieves the tags associated with the authenticated user.
     *
     * @param Request $request The HTTP request object.
     * @return \Illuminate\Http\JsonResponse The JSON response containing the tags.
     */
    public function get(Request $request)
    {
        return response()->json($this->getTags($request, ["name", "ASC"]));
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

        return back()->with("tags", $this->getTags($request));
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
            return response()->json([
                "message" => "Successfully changed tag name",
                "tags" => $this->getTags($req, ["name", "ASC"]),
            ]);
        }
        // This error should not happen unless database failes to save the record
        return response()->json(["message" => "It seems that database did not save new name", "tags" => []], 500);
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
                            "message" => "We could not delete picture from our database, please try again",
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
        return response()->json([
            "message" => "Successfully deleted tags",
            "tags" => $this->getTags($req, ["name", "ASC"]),
        ]);
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
                if (in_array($tag, $img->tags) == (intval($option) == 1) ? false : true && !in_array($tag, $rtnIds)) {
                    // If not in array, add it to array
                    $rtnIds[] = $tag;
                }
            }
        }

        $rtnTags = $user->tag()->select("id", "name")->whereIn("id", $rtnIds)->get();
        return $rtnTags;
    }

    public function setImagesTags(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "tags" => "required|array",
            "pictures" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data
        $user = auth()->user();

        // Loop through all pictures, and add tags with id if they do not have it
        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();
            if (!$pic) {
                continue;
            }

            $tmp = $pic["tags"];

            foreach ($data["tags"] as $tagId) {
                if (!in_array($tagId, $tmp)) {
                    $tmp[] = $tagId;
                }
            }

            $pic["tags"] = $tmp;
            if (!$pic->save()) {
                return response("Could not add tag to the picture", 500);
            }
        }

        return response()->json(["message" => "Successfully added tags to pictures"]);
    }

    public function removeImagesTags(Request $req)
    {
        $validator = Validator::make($req->all(), [
            "tags" => "required|array",
            "pictures" => "required|array",
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        }

        //process the request
        $data = $validator->valid(); // validated data
        $user = auth()->user();

        // Warning to the user, that picture cannot be removed, because it has only one tag
        $onlyOneTag = false;

        // Loop through all pictures, and add tags with id if they do not have it
        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();

            if (!$pic) {
                continue;
            }

            // $tmp -> picture tags that will get removed and saved later
            $tmp = $pic["tags"];

            foreach ($data["tags"] as $tagId) {
                // If picture has only one tag, then skip the removal
                if (count($tmp) == 1) {
                    $onlyOneTag = true;
                    continue;
                }

                // If picture has the tag, then it needs to be removed
                $idx = array_search($tagId, $tmp);
                if ($idx !== false) {
                    array_splice($tmp, $idx, 1);
                }
            }

            $pic["tags"] = $tmp;
            if (!$pic->save()) {
                return response("Could not remove tag to the picture", 500);
            }
        }

        if ($onlyOneTag) {
            return response()->json([
                "message" => "Some picture tags weren't removed, because picture had only 1 tag left",
            ]);
        } else {
            return response()->json(["message" => "Successfully removed tags from pictures"]);
        }
    }

    public function softDeleteTag(Request $req)
    {
        // Validate that tag is not a string, and exists in database
        try {
            $data = ValidateApi::validate($req, ["tag_id" => "required|numeric|exists:tags,id"]);
        } catch (Exception $err) {
            return response()->json($err->getMessage(), $err->getCode());
        }

        $tag = Tags::find($data["tag_id"]);
        // Check if it belongs to user
        if ($tag->user_id != auth()->id()) {
            return response()->json(["message" => "This tag does not exist"], 404);
        }

        // Check if tag can be soft deleted
        if (!TagsHelper::CanSoftDelete($data["tag_id"])) {
            return response()->json(["message" => "This tag cannot be soft deleted"], 500);
        }

        $tag->delete();
        return response()->json([
            "message" => 'Soft deleted "' . $tag->name . '" successfully',
            "tags" => $this->getTags($req),
        ]);
    }

    public function hidden_get_tags()
    {
        $user = auth()->user();
        $hiddenPics = $user->picture()->select("tags")->where("hidden", true)->get();

        // Get distinct tags ids
        $tagIds = [];
        foreach ($hiddenPics as $pic) {
            $tagIds = array_unique(array_merge($tagIds, $pic->tags));
        }

        $tags = Tags::whereIn("id", $tagIds)->get();

        return response()->json($tags);
    }

    public function get_sub_tags()
    {
        // Get only sub_tags from users pictures
        $tags = auth()->user()->picture()->select("sub_tags")->where("hidden", false)->get()->pluck("sub_tags");
        $uniqueTags = [];

        foreach ($tags as $jsonStr) {
            $json = json_decode($jsonStr);
            if ($json == null) {
                continue;
            }

            $uniqueTags = array_merge($uniqueTags, $json);
        }

        // Remove duplicates, and then reindex the array, so there's not missing indexes
        $rtn = array_values(array_unique($uniqueTags));
        return response()->json((array) $rtn);
    }
}
