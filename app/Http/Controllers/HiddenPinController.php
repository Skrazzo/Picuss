<?php

namespace App\Http\Controllers;

use App\Helpers\ValidateApi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

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
     * @param Request $req
     * @return bool
     */
    public function authenticated(Request $req)
    {
        $pin = auth()->user()->pin()->first();
        if (!$pin) {
            return false;
        }

        $pinCode = session("pin");
        if ($pinCode === null) {
            return false;
        }

        if (!Hash::check($pinCode, $pin->pin)) {
            return false;
        }

        return true;
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

        $rules = ["pin" => "required|min:6"];
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
            return response()->json(["message" => "Pin incorrect"], 401);
        }

        // Securely store the pin code in the session, for temp file decyption and encryption
        session()->put("pin", $data["pin"]);
        // return response()->json([
        //     "message" => "Pin correct",
        // ]);
        return back();
    }
}
