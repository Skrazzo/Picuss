<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $req)
    {
        return Inertia::render("AdminPanel/Admin", ["title" => "Admin panel"]);
    }
}
