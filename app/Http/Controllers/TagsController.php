<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class TagsController extends Controller
{
    /**
     * Renders the tags management page using the Inertia library.
     *
     * @param Request $request The HTTP request object.
     * @return \Inertia\Response The Inertia response.
     */
    public function index(Request $req) {
        // $pictures = $req->user()->picture()->get();
        $tags = $req->user()->tag()
            ->orderBy('name', 'ASC')
            ->get()
            ->map(function ($tag, $idx) {
                // Search json for the tag id
                $pictureCount = auth()->user()->picture()->whereJsonContains('tags', $tag['id'])->count();
                     
                return ['name' => $tag['name'], 'id' => $tag['id'], 'pictureCount' => $pictureCount];
            });

                
        return Inertia::render('ManageTags');
    }

    /**
     * Retrieves the tags associated with the authenticated user.
     *
     * @param Request $request The HTTP request object.
     * @return \Illuminate\Http\JsonResponse The JSON response containing the tags.
     */
    public function get(Request $request)
    {
        // Get only needed info from the database, and sort it        
        $tags = $request->user()->tag()
            ->orderBy('name', 'ASC')
            ->get()
            ->map(function ($tag) {
                return ['name' => $tag['name'], 'id' => $tag['id']];
            });

        return response()->json($tags);
    }

    /**
     * Creates a new tag.
     *
     * @param Request $request The HTTP request object.
     * @return \Illuminate\Http\RedirectResponse The redirect response.
     */
    public function create(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|max:20'
        ]);

        $data['name'] = strtolower($data['name']); // all tags should be saved in lowercase

        $user = $request->user();
        $tag = $user->tag()->where('name', $data['name'])->first();

        if ($tag) {
            return back()->withErrors([
                'name' => 'Tag already exists!'
            ]);
        }

        $user->tag()->create($data);

        return back();
    }
}
