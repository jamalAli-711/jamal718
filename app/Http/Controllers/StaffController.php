<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of the staff members (Drivers, Reps, Distributors).
     */
    public function index()
    {
        $staffTypes = [UserType::SalesRep->value, UserType::Driver->value, UserType::Distributor->value];
        
        return Inertia::render('Staff/Index', [
            'staff' => User::whereIn('user_type', $staffTypes)->orderBy('created_at', 'desc')->get(),
            'types' => [
                ['value' => UserType::SalesRep->value, 'label' => 'مندوب مبيعات'],
                ['value' => UserType::Driver->value, 'label' => 'سائق'],
                ['value' => UserType::Distributor->value, 'label' => 'موزع ميداني'],
            ]
        ]);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'user_type' => 'required|integer',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'تم إضافة الموظف بنجاح');
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'user_type' => 'required|integer',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'user_type' => $request->user_type,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        return redirect()->back()->with('success', 'تم تحديث بيانات الموظف بنجاح');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'تم حذف الموظف من النظام');
    }
}
