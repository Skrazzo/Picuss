<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TagsController extends Controller
{
    public function index(Request $req){
        return Inertia::render('ManageTags');
    }

    public function create(Request $req){
        $data = $req->validate([
            'name' => 'required|max:20'
        ]);

        $data['name'] = strtolower($data['name']); // all tags should be saved in lowercase

        $user = $req->user();
        $tag = $user->tag()->where('name', $data['name'])->first();
        
        if($tag) {
            return back()->withErrors([
                'name' => 'Tag already exists!'
            ]);
        }

        $user->tag()->create($data);

        return back();
    }
}
