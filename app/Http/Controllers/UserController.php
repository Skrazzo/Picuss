<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function logout(Request $req)
    {
        auth()->logout();
        return redirect(route("login"));
    }

    public function register(Request $req)
    {
        $data = $req->validate([
            "username" => "required|unique:users,username",
            "password" => "required|min:8",
        ]);

        User::create($data);

        $this->login($req);
        return redirect(route("dashboard"));
    }

    public function login(Request $req)
    {
        $credentials = $req->validate([
            "username" => "required",
            "password" => "required",
        ]);

        if (auth()->attempt($credentials, true)) {
            $req->session()->regenerate();
            return redirect(route("dashboard"));
        }

        return back()->withErrors([
            "error" => "Username or password is incorrect!",
        ]);
    }

    public function get_modal_info(Request $req)
    {
        $user = $req->user();

        $picture_count = $user->picture()->get()->count();
        $tag_count = $user->tag()->get()->count();

        $rtn = [
            "pictures" => $picture_count == 0 ? "No pictures" : $picture_count . " pictures",
            "tags" => $tag_count == 0 ? "No tags" : $tag_count . " tags",
            "last_picture_uploaded" =>
                $picture_count == 0
                    ? "Never uploaded"
                    : str_replace(
                        "before",
                        "ago",
                        $user->picture()->latest()->first()->created_at->diffForHumans(now())
                    ),
            "last_tag_created" =>
                $tag_count == 0
                    ? "Never created"
                    : str_replace(
                        "before",
                        "ago",
                        $user->tag()->latest()->first()->created_at->diffForHumans(now())
                    ),
            "user_created" => str_replace("before", "ago", $user->created_at->diffForHumans(now())),
        ];

        return response()->json($rtn);
    }
}
