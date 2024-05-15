<?php

namespace App\Http\Controllers;

use App\Models\Tags;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
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
        $tags = $req->user()->tag()
            ->orderBy('created_at', 'DESC')
            ->get()
            ->map(function ($tag, $idx) {
                // Search json for the tag id
                // It shows an error, but trust me bro, it works
                $pictureCount = auth()->user()->picture()->whereJsonContains('tags', $tag['id'])->count();
                     
                return ['name' => $tag['name'], 'id' => $tag['id'], 'pictureCount' => $pictureCount];
            });

                
        return Inertia::render('ManageTags', [ 'tags' => $tags ]);
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

    function editName(Tags $tag, Request $req) {
        $data = $req->validate([
            'name' => 'required|max:20'
        ]);

        if ($tag->user_id !== $req->user()->id) {
            return response()->json([ 'message' => 'This is not your tag ...' ], 403);
        }

        $tag->name = strtolower($data['name']);
        if($tag->save()) {
            // Get only needed info from the database, and sort it        
            $tags = $req->user()->tag()
                ->orderBy('name', 'ASC')
                ->get()
                ->map(function ($tag, $idx) {
                    // Search json for the tag id
                    // It shows an error, but trust me bro, it works
                    $pictureCount = auth()->user()->picture()->whereJsonContains('tags', $tag['id'])->count();
                         
                    return ['name' => $tag['name'], 'id' => $tag['id'], 'pictureCount' => $pictureCount];
                });

            return response()->json([ 'message' => 'Successfully changed tag name', 'tags' => $tags ]);
        }
        
        return response()->json([ 'message' => 'It seems that database did not save new name', 'tags' => [] ]);
    }
}
