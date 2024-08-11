<?php

namespace App\Helpers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ValidateApi
{
    public static function validate(Request $req, $rules)
    {
        $validator = Validator::make($req->all(), $rules);

        if ($validator->fails()) {
            throw new Exception($validator->messages(), 422);
        }

        // Return validated data
        return $validator->valid();
    }
}
