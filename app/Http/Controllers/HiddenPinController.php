<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
use App\Helpers\Encrypt;
use App\Helpers\ValidateApi;
use App\Models\Picture;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use ZipArchive;

class HiddenPinController extends Controller
{
    public function index(Request $req)
    {
        $pin = session("pin");
        $allowed = false;

        // TODO: add a check, that if user has no hidden pictures, then allowed -> true
        // TODO: return hidden pictures

        if ($pin !== null) {
            $allowed = true;
        }

        return Inertia::render("Hidden", [
            "allowed" => $allowed,
            "title" => "Hidden pictures",
            "hasPin" => auth()->user()->pin()->first() ? true : false, // Returns if user has ever made a pin
        ]);
    }

    /**
     * Returns information about the user's hidden pin.
     *
     * @api {get} /hidden/info Get hidden pin info
     * @apiName GetHiddenPinInfo
     * @apiGroup Hidden
     * @apiPermission Only for authenticated users
     *
     * @apiSuccess {Boolean} hasPin If the user has ever made a pin
     * @apiSuccess {Boolean} authenticated If the user is currently authenticated with the correct pin
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 Ok
     *     {
     *       "hasPin": true,
     *       "authenticated": true
     *     }
     */
    public function info(Request $req)
    {
        $user = auth()->user();
        $hasPin = $user->pin()->first() ? true : false;

        return response()->json([
            "hasPin" => $hasPin,
            "authenticated" => $this->authenticated($req),
        ]);
    }

    /**
     * Checks if the user is authenticated with the correct pin code.
     * If pin is not set, returns false.
     * If pin code is not set in the session, returns false.
     * If the pin code in the session does not match the hash in the database, returns false.
     * Otherwise returns true.
     *
     * @return bool
     */
    public function authenticated()
    {
        $pin = auth()->user()->pin()->first();
        if (!$pin) {
            return false;
        }

        $pinCode = session("pin");
        if ($pinCode === null) {
            return false;
        }

        if (!Hash::check($pinCode, $pin->hash)) {
            return false;
        }

        return true;
    }

    public function hide(Request $req)
    {
        if (!$this->authenticated($req)) {
            return abort(403);
        }

        try {
            $data = ValidateApi::validate($req, ["pictures" => "required|array"]);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), $e->getCode());
        }

        $user = auth()->user();
        $disks = Disks::allDisks();
        $pin = session("pin");

        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();

            if (!$pic) {
                // If picture does not exist, skip it
                continue;
            }

            // Check if picture has been shared
            $shared = $pic->sharedImage()->first();
            if ($shared) {
                $shared->delete();
            }

            // Encrypt the picture
            try {
                Encrypt::encryptFiles($disks, [$pic->image], $pin);
            } catch (Exception $e) {
                \Log::info("ERROR while hiding picture: " . $e->getMessage());
            }

            $pic->hidden = true;
            $pic->save();
        }

        return response(200);
    }

    public function reveal(Request $req)
    {
        if (!$this->authenticated($req)) {
            return abort(403);
        }

        try {
            $data = ValidateApi::validate($req, ["pictures" => "required|array"]);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), $e->getCode());
        }

        $user = auth()->user();
        $disks = Disks::allDisks();
        $pin = session("pin");

        foreach ($data["pictures"] as $picId) {
            $pic = $user->picture()->where("public_id", $picId)->first();

            if (!$pic) {
                // If picture does not exist, skip it
                continue;
            }

            // Decrypt the picture
            try {
                Encrypt::decryptFiles($disks, [$pic->image], $pin);
            } catch (Exception $e) {
                \Log::info("ERROR while revealing picture: " . $e->getMessage());
            }

            $pic->hidden = false;
            $pic->save();
        }

        return response(200);
    }

    /**
     * @api {post} /hidden/auth Authorize user with a pin
     * @apiName AuthorizeWithPin
     * @apiGroup Hidden
     * @apiPermission Only for authenticated users
     *
     * @apiParam {String} pin The 6-digit pin code
     *
     * @apiSuccess {String} message Pin correct
     *
     * @apiError {String} message Pin incorrect
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *       "message": "Pin incorrect"
     *     }
     */
    public function auth(Request $req)
    {
        $isInertia = $req->header("X-Inertia") === "true";

        $rules = ["pin" => "required|digits:6"];
        if ($isInertia) {
            // If inertia called this instance, then we need to return error according to Inertia response
            $data = $req->validate($rules);
        } else {
            // Api type response
            try {
                $data = ValidateApi::validate($req, $rules);
            } catch (Exception $e) {
                return response()->json($e->getMessage(), $e->getCode());
            }
        }

        /*
            We need to check if user pin exists and if pin is correct via hash in the database
            1. if the hash does not exist, then we need to create new hash, and authorizate the user
            2. if the hash exists, we need to check if the pin is correct, and authorizate the user
            3. if pin is not correct, return error
        */

        $user = auth()->user();
        $userPin = $user->pin()->first();

        // Pin does not exist, so we are creating it
        if (!$userPin) {
            $user->pin()->create(["hash" => $data["pin"]]);
        }

        // If pin exists, return error if pin is not correct
        if ($userPin && !Hash::check($data["pin"], $userPin->hash)) {
            return response()->json(["message" => "Incorrect pin-code"], 401);
        }

        // Securely store the pin code in the session, for temp file decyption and encryption
        session()->put("pin", $data["pin"]);

        if ($isInertia) {
            return back();
        }
        return response()->json([
            "message" => "Pin correct",
        ]);
    }

    public function get_full_picture(Picture $picture)
    {
        if (!$this->authenticated()) {
            return response("Not authorized", 401);
        }

        if (auth()->id() != $picture->user_id) {
            return response('You\'re not allowed to view this', 403);
        }

        // Get storages
        $disk = Disks::image();

        // Check if image exists, show error if doesn't
        if (!$disk->exists($picture->image)) {
            return response("Not found", 404);
        }

        // $halfImage = Encrypt::decrypt($disk, $picture->image, session("pin"));
        if (Encrypt::isEncrypted($disk, $picture->image)) {
            $halfImage = Encrypt::decrypt($disk, $picture->image, session("pin"));

            return response($halfImage, 200);
        } else {
            $decryptedImage = $disk->get($picture->image);

            // Encrypt the thumbnail if it is not encrypted because of the permission bug
            try {
                $out = Encrypt::encrypt($disk, $picture->image, session("pin"));
                $disk->put($picture->image, $out);
            } catch (Exception $e) {
                \Log::info(
                    "ERROR while viewing full image in hidden section " . $picture->image . ": " . $e->getMessage()
                );
            }

            return response($decryptedImage, 200);
        }
        return response($halfImage, 200);
    }

    public function get_half_picture(Picture $picture)
    {
        if (!$this->authenticated()) {
            return response("Not authorized", 401);
        }

        if (auth()->id() != $picture->user_id) {
            return response('You\'re not allowed to view this', 403);
        }

        // Get storages
        $disk = Disks::half();

        // Check if image exists, show error if doesn't
        if (!$disk->exists($picture->image)) {
            return response("Not found", 404);
        }

        // Check if image is encrypted, decrypt it (Sometimes it isn't because of a bug I had in the past)
        if (Encrypt::isEncrypted($disk, $picture->image)) {
            $halfImage = Encrypt::decrypt($disk, $picture->image, session("pin"));

            return response($halfImage, 200);
        } else {
            $decryptedImage = $disk->get($picture->image);

            // Encrypt the thumbnail if it is not encrypted because of the permission bug
            try {
                $out = Encrypt::encrypt($disk, $picture->image, session("pin"));
                $disk->put($picture->image, $out);
            } catch (Exception $e) {
                \Log::info(
                    "ERROR while viewing half image in hidden section " . $picture->image . ": " . $e->getMessage()
                );
            }

            return response($decryptedImage, 200);
        }
    }

    public function get_resized_images(Request $req, $page)
    {
        if (!$this->authenticated()) {
            return response("Not authorized", 401);
        }

        // TODO: If in the future i won't be using other disks, then remove this, and use only thumb Disk
        [$image, $half, $thumb] = Disks::allDisks();

        if ($page < 1) {
            return response()->json(["message" => "Page cannot be below 0"], 422);
        }

        // queriedTags
        $queryTags = [];

        // Check either user is querying tags or not
        $data = $req->all();
        if (isset($data["queryTags"])) {
            $queryTags = json_decode($data["queryTags"]);
        }

        // Picture per page
        $perPage = env("perPage", 40);
        $skip = ($page - 1) * $perPage;

        $pictures = $req
            ->user()
            ->picture()
            ->where(function ($query) use ($queryTags) {
                // This function searches for tags in json
                foreach ($queryTags as $tagId) {
                    $query->orWhereJsonContains("tags", $tagId);
                }
            })
            ->where("hidden", true) // Search only pictures that are encrypted
            ->orderBy("created_at", "DESC")
            ->skip($skip)
            ->take($perPage)
            ->get();

        // build a return array
        $rtn_arr = [
            "totalPages" => ceil(
                $req
                    ->user()
                    ->picture()
                    ->where(function ($query) use ($queryTags) {
                        // This function searches for tags in json
                        foreach ($queryTags as $tagId) {
                            $query->orWhereJsonContains("tags", $tagId);
                        }
                    })
                    ->where("hidden", true)
                    ->count() / $perPage
            ),
            "images" => [],
        ];

        foreach ($pictures as $pic) {
            // Have to check if thumbnail is encrypted, in case permission bug has happened, and didnt encrypt the tumbnail
            // TODO: Make sure that when automatic script for thumbnail generation launches, the thumbnails have correct file owner (www-data), this probably would be a good idea to specify in the .env file :)
            $thumbBase64 = "data:image/jpeg;base64,";
            if (Encrypt::isEncrypted($thumb, $pic->image)) {
                // Already includes 'data:image/jpeg;base64,'
                $thumbBase64 = Encrypt::decrypt2Base64($thumb, $pic->image, session("pin"));
            } else {
                $thumbBase64 .= base64_encode($thumb->get($pic->image));

                // Try to encrypt if not already encrypted
                try {
                    $out = Encrypt::encrypt($thumb, $pic->image, session("pin"));
                    $thumb->put($pic->image, $out);
                } catch (Exception $e) {
                    \Log::info(
                        "ERROR while viewing thumbnail in hidden section " . $pic->image . ": " . $e->getMessage()
                    );
                }
            }

            $rtn_arr["images"][] = [
                "id" => $pic->public_id,
                "name" => $pic->image,
                "size" => round($pic->size, 3),
                "tags" => $pic->tags,
                "uploaded" => $pic->created_at,
                "uploaded_ago" => str_replace("before", "ago", $pic->created_at->diffForHumans(now())),
                "thumb" => $thumbBase64,
                "width" => $pic->width,
                "height" => $pic->height,
                "aspectRatio" => round($pic->width / $pic->height, 2) . "/1",
            ];
        }

        return response()->json($rtn_arr);
    }

    public function download_multiple_images($ids)
    {
        if (!$this->authenticated()) {
            return abort(403);
        }

        $validator = Validator::make(
            ["ids" => json_decode($ids)],
            [
                "ids" => ["required", "array"],
            ]
        );

        if ($validator->fails()) {
            return response()->json($validator->messages(), 422);
        }

        $data = $validator->validated();
        $user = auth()->user();

        $imageDisk = Disks::image();
        $tmp = Disks::tmp();
        $zip = new ZipArchive();
        $zipName = $user->username . "_hidden_pictures_" . date(now()) . ".zip";

        if ($zip->open($tmp->path($zipName), ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($data["ids"] as $id) {
                $picture = Picture::where("public_id", $id)->first();

                // Check if picture belongs to user
                if ($picture->user_id !== $user->id) {
                    $zip->close();
                    $tmp->delete($zipName);
                    return abort(403);
                }

                // Check if picture exists on the disk
                if (!$imageDisk->exists($picture->image)) {
                    continue;
                }

                // Decrypt and add images to the zip file
                // Check if image is encrypted
                if (Encrypt::isEncrypted($imageDisk, $picture->image)) {
                    $image = Encrypt::decrypt($imageDisk, $picture->image, session("pin"));
                    $zip->addFromString($picture->image, $image);
                } else {
                    // Add image to the zip without decryption
                    $zip->addFromString($picture->image, $imageDisk->get($picture->image));
                }
            }

            // Close the archive
            $zip->close();
            return response()->download($tmp->path($zipName))->deleteFileAfterSend(true);
        } else {
            return response()->json(["error" => "Unable to create ZIP archive"], 500);
        }
    }

    public function change_pin(Request $req)
    {
        $data = $req->validate([
            "current" => "required|integer|digits:6",
            "new" => "required|integer|digits:6|different:current|confirmed",
        ]);

        $user = auth()->user();
        $userPin = $user->pin()->first();

        if ($userPin && !Hash::check($data["current"], $userPin->hash)) {
            return back()->withErrors(["current" => "Current pin is not correct"]);
        }

        $storages = Disks::allDisks();
        // Decrypt every picture and then encrypt it with different password
        $pictures = $user->picture()->where("hidden", true)->get();
        foreach ($pictures as $pic) {
            try {
                Encrypt::decryptFiles($storages, [$pic->image], $data["current"]);
                Encrypt::encryptFiles($storages, [$pic->image], $data["new"]);
            } catch (Exception $e) {
                return back()->withErrors(["new" => "Unable to change pin", "error" => $e->getMessage()]);
            }
        }

        session()->forget("pin");
        $userPin->hash = $data["new"];
        $userPin->save();

        return back();
    }

    /**
     * Deletes the user's hidden pin.
     *
     * @param Request $req
     * @return \Illuminate\Http\RedirectResponse
     */
    public function delete_pin(Request $req)
    {
        $data = $req->validate(["password" => "required"]);

        $user = auth()->user();

        if (!Hash::check($data["password"], $user->password)) {
            return back()->withErrors(["password" => "Current password is not correct"]);
        }

        // Delete all hidden pictures
        $storages = Disks::allDisks();
        $pictures = $user->picture()->where("hidden", true)->get();

        foreach ($storages as $storage) {
            foreach ($pictures as $pic) {
                // Check if the picture exists on each storage
                if ($storage->exists($pic->image)) {
                    // Delete the picture
                    $storage->delete($pic->image);
                }
            }
        }

        // Delete all pictures from database
        $user->picture()->where("hidden", true)->delete();

        // Delete the pin
        session()->forget("pin");
        $user->pin()->delete();

        return back();
    }
}
