<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $req)
    {
        // User data
        $users = User::select(["id", "username", "is_admin", "created_at"])->get();

        // Return variables
        $title = "Admin panel";
        return Inertia::render("AdminPanel/Admin", compact("users", "title"));
    }
}
