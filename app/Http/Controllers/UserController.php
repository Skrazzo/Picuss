<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
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

        // Get users disk usage
        [$imageDisk, $halfDisk, $thumbDisk] = Disks::allDisks();

        $diskUsage = 0; // In bytes
        $pictures = $user->picture()->get();

        // Loop through every user picture in every disk, and get their size
        foreach ($pictures as $pic) {
            $img = $pic->image;

            if ($imageDisk->exists($img)) {
                $diskUsage += $imageDisk->size($img);
            }

            if ($halfDisk->exists($img)) {
                $diskUsage += $halfDisk->size($img);
            }

            if ($thumbDisk->exists($img)) {
                $diskUsage += $thumbDisk->size($img);
            }
        }

        // Convert to MB
        $diskUsage = $diskUsage / (1024 * 1024);

        // Convert to GB if needed
        if ($diskUsage > 1000) {
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
                    : str_replace(
                        "before",
                        "ago",
                        $user->tag()->latest()->first()->created_at->diffForHumans(now())
                    ),
            "user_created" => str_replace("before", "ago", $user->created_at->diffForHumans(now())),
            "disk_usage" => $diskUsage,
        ];

        return response()->json($rtn);
    }
}
