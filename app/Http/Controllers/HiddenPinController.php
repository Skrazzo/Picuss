<?php

namespace App\Http\Controllers;

use App\Helpers\ValidateApi;
use Exception;
use Illuminate\Http\Request;

class HiddenPinController extends Controller
{
    public function auth(Request $req)
    {
        try {
            $data = ValidateApi::validate($req, [
                "pin" => "required|length:5",
            ]);
        } catch (Exception $e) {
            return response()->json($e->getMessage(), $e->getCode());
        }

        // TODO: Finish auth

        /*
            We need to check if user pin exists and if pin is correct via hash in the database
            1. if the hash does not exist, then we need to create new hash, and authorizate the user
            2. if the hash exists, we need to check if the pin is correct, and authorizate the user
            3. if pin is not correct, return error
        */
    }
}
