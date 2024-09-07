<?php

namespace App\Http\Controllers;

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
        // Returns json of created images per day
        $data = DB::table("pictures")
            ->select(DB::raw("DATE(created_at) as date"), DB::raw("count(*) as count"))
            ->groupBy("date")
            ->get();

        return response()->json(["pictures" => ["created_count" => $data]]);
    }
}
