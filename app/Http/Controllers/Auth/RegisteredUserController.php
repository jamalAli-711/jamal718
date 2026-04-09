<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use App\Models\Location;
use App\Enums\UserType;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'branches' => Branch::all()
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:20',
            'branch_id' => 'required|exists:branches,id',
            'user_type' => 'required|in:'.UserType::Wholesaler->value.','.UserType::Retailer->value.','.UserType::Customer->value,
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'branch_id' => $request->branch_id,
            'user_type' => $request->user_type,
        ]);


        Location::create([
            'user_id' => $user->id,
            'latitude' => $request->lat,
            'longitude' => $request->lng,
            'branch_id' => $request->branch_id,
            'created_by' => $user->id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('customer.dashboard', absolute: false));
    }
}
