<?php

namespace App\Http\Controllers;

use App\Models\Tags;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShareTagsController extends Controller
{
    
    public function shareTags(Request $req) {
        $validator = Validator::make($req->all(), [
            'tags' => 'required|array'
        ]);
        
        if ($validator->fails()) {
            return response()->json($validator->messages(), 500);
        } 
        
        //process the request
        $data = $validator->valid(); // validated data
        
        
        // $id => tag id
        foreach ($data['tags'] as $id) { 
            $tag = Tags::find($id);

            // Check if tag exists and belongs to a user
            if (!$tag) continue;
            if ($tag->user_id !== auth()->id()) continue;
            if ($tag->share()->first()) continue ; // Share already exists
            
            $tag->share()->create(['user_id' => auth()->id()]);
        }

    }
}
