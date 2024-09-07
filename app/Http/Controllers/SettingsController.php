<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $data = DB::table("pictures")
            ->select(DB::raw("DATE(created_at) as day"), DB::raw("count(*) as value"))
            ->where("user_id", auth()->id())
            ->whereYear("created_at", Carbon::now()->year)
            ->groupBy("day")
            ->get();

        return response()->json(["pictures" => ["calendarData" => $data]]);
    }
}
