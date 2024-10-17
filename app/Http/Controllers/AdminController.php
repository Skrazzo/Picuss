<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
use App\Helpers\Users;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $req)
    {
        // User data
        $users = User::select(["id", "username", "is_admin", "created_at", "limit"])->get();

        // Return variables
        $title = "Admin panel";
        return Inertia::render("AdminPanel/Admin", compact("users", "title"));
    }

    public function delete_user(Request $req)
    {
        $data = $req->validate(["user_id" => "required|numeric|exists:users,id"]);
        try {
            Users::delete($data["user_id"]);
        } catch (Exception $err) {
            return response($err->getMessage(), 500);
        }

        return back();
    }

    public function change_user_password(Request $req)
    {
        $data = $req->validate([
            "user_id" => "required|numeric|exists:users,id",
            "new_password" => "required|min:8",
        ]);

        $user = User::find($data["user_id"]);

        try {
            $user->password = $data["new_password"];
            $user->save();
        } catch (Exception $err) {
            return response($err->getMessage(), 500);
        }

        return back();
    }

    public function change_user_limit(Request $req)
    {
        $data = $req->validate([
            "user_id" => "required|numeric|exists:users,id",
            "limit" => "required|numeric|min:0",
        ]);
        // Limit user used storage + 1 MB and then converted into GB

        $user = User::find($data["user_id"]);
        if (!$user) {
            return response("User does not exist", 404);
        }

        try {
            if (floatval($data["limit"]) === 0.0) {
                $user->limit = null;
            } else {
                // Check if I can set limit this low
                $minLimit = round((Disks::totalUsedSpace($req->user_id) + 1) / 1024, 2);
                if ($minLimit > $data["limit"]) {
                    return back()->withErrors(["limit" => "Limit has to be at least $minLimit GB"]);
                }

                $user->limit = $data["limit"];
            }
            $user->save();
        } catch (Exception $e) {
            return response($e->getMessage(), 500);
        }

        return back();
    }
}
