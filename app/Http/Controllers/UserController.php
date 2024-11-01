<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
use App\Models\RequestedAccount;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function logout(Request $req)
    {
        $req->session()->invalidate(); // Clear session
        auth()->logout();
        return redirect(route("login"));
    }

    public function register(Request $req)
    {
        $data = $req->validate([
            "username" => "required|unique:users,username",
            "password" => "required|min:8",
        ]);

        // Check if registration is allowed
        if (env("REGISTRATION_ALLOWED", false) == false) {
            // Create requested account
            $reqAcc = RequestedAccount::where("username", $data["username"])->first();
            if ($reqAcc) {
                return back()->withErrors(["username" => "Username is not available!"]);
            }

            // Create requested account
            $success = RequestedAccount::create($data);
            if (!$success) {
                return back()->withErrors(["username" => "Could not create account"]);
            }
            return back()->with("status", "requested");
        }

        // If user is first, then make him an admin user
        $isFirstUser = User::count() == 0;
        User::create(array_merge($data, ["is_admin" => $isFirstUser]));

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

        $diskUsage = 0;
        try {
            $diskUsage = Disks::totalUsedSpace($user->id);
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
        }

        // Convert to GB if needed
        if ($diskUsage > 1024) {
            $diskUsage = round($diskUsage / 1024, 2) . " GB";
        } else {
            $diskUsage = round($diskUsage, 2) . " MB";
        }

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
                    : str_replace("before", "ago", $user->tag()->latest()->first()->created_at->diffForHumans(now())),
            "user_created" => str_replace("before", "ago", $user->created_at->diffForHumans(now())),
            "disk_usage" => $diskUsage,
            "user_limit" => $user->limit,
        ];

        return response()->json($rtn);
    }
}
