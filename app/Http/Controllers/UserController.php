<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function logout(Request $req){
        auth()->logout();
        return redirect(route('login'));
    }

    public function register(Request $req){
        $data = $req->validate([
            'username' => 'required|unique:users,username',
            'password' => 'required|min:8'
        ]);

        User::create($data);

        $this->login($req);
        return redirect(route('dashboard'));
    }

    public function login(Request $req){
        $credentials = $req->validate([
            'username' => 'required',
            'password' => 'required',
        ]);
 
        if (auth()->attempt($credentials, true)) {
            $req->session()->regenerate();
            return redirect(route('dashboard'));
        }
 
        return back()->withErrors([
            'error' => 'Username or password is incorrect!',
        ]);
    }
}
