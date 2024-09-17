<?php

namespace App\Http\Controllers;

use App\Helpers\Disks;
use App\Models\Picture;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render("Settings");
    }

    public function get_stats()
    {
        // Returns json of created images per day (For calendar chart)
        /*
        Return for all years
        $data = DB::table("pictures")
            ->select(DB::raw("DATE(created_at) as day"), DB::raw("count(*) as value"))
            ->groupBy("day")
            ->get();
        */

        $calendarData = DB::table("pictures")
            ->select(DB::raw("DATE(created_at) as day"), DB::raw("count(*) as value"))
            ->where("user_id", auth()->id())
            ->whereYear("created_at", Carbon::now()->year)
            ->groupBy("day")
            ->get();

        $tagData = auth()
            ->user()
            ->tag()
            ->get()
            ->map(function ($tag) {
                return [
                    "id" => $tag->name,
                    "label" => $tag->id,
                    "value" => Picture::whereJsonContains("tags", $tag->id)->count(),
                ];
            });

        return response()->json([
            "pictures" => ["calendarData" => $calendarData],
            "tags" => ["pieData" => $tagData],
        ]);
    }

    public function change_password(Request $req)
    {
        $data = $req->validate([
            "current" => "required",
            "new" => "required|min:8|confirmed|different:current",
        ]);

        $user = auth()->user();
        if (!Hash::check($data["current"], $user->password)) {
            return back()->withErrors(["current" => "Current password is not correct"]);
        }

        $user->password = $data["new"];
        $user->save();
        return back();
    }

    public function delete_account(Request $req)
    {
        $data = $req->validate([
            "password" => "required|string",
        ]);

        $user = auth()->user();

        if (!Hash::check($data["password"], $user->password)) {
            return back()->withErrors(["password" => "Current password is not correct"]);
        }

        // TODO: When encryption for hidden pictures is implemented, need to delete all hidden pictures too

        // Get all image storages
        [$full, $half, $thumb] = Disks::allDisks();

        // Delete all pictures
        $pictures = $user->picture()->get();
        foreach ($pictures as $pic) {
            if ($full->exists($pic->image)) {
                $full->delete($pic->image);
            }

            if ($half->exists($pic->image)) {
                $half->delete($pic->image);
            }

            if ($thumb->exists($pic->image)) {
                $thumb->delete($pic->image);
            }

            $pic->delete();
        }

        // Delete all tags
        $user->tag()->delete();

        // TODO: Send email to the user, about its account being deleted

        // delete user itself
        $user->delete();

        return redirect(route("dashboard"));
    }
}
