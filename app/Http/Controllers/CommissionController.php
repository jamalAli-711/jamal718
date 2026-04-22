<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AgentCustomer;
use App\Models\CommissionRule;
use App\Models\CommissionLog;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    /**
     * Display a management dashboard for commissions and agent assignments.
     */
    public function index()
    {
        return Inertia::render('Commissions/Index', [
            'agents' => User::where('user_type', UserType::SalesRep)->withCount('customers')->get(),
            'rules' => CommissionRule::all(),
            'recentLogs' => CommissionLog::with(['agent', 'order.customer'])->latest()->take(10)->get(),
            'categories' => \App\Models\Category::all(['id', 'category_name as name']),
            'products' => \App\Models\Product::all(['id', 'name'])
        ]);
    }

    /**
     * Manage Agent-Customer assignments.
     */
    public function manageAssignments($agentId)
    {
        $agent = User::findOrFail($agentId);
        
        return Inertia::render('Commissions/Assignments', [
            'agent' => $agent,
            'assignedCustomers' => $agent->customers,
            'availableCustomers' => User::where('user_type', UserType::Customer)
                ->whereDoesntHave('agents') // Or allowed to have multiple? The user said "Only him sees it"
                ->get()
        ]);
    }

    /**
     * Store Assignment.
     */
    public function storeAssignment(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:users,id',
            'customer_id' => 'required|exists:users,id',
        ]);

        AgentCustomer::firstOrCreate([
            'agent_id' => $request->agent_id,
            'customer_id' => $request->customer_id,
        ]);

        return redirect()->back()->with('success', 'تم ربط الزبون بالمندوب بنجاح');
    }

    /**
     * Store Commission Rule.
     */
    public function storeRule(Request $request)
    {
        $request->validate([
            'rule_name' => 'required|string',
            'commission_percentage' => 'required|numeric|min:0|max:100',
            'target_type' => 'required',
        ]);

        CommissionRule::create($request->all());

        return redirect()->back()->with('success', 'تم إضافة قاعدة العمولة بنجاح');
    }

    /**
     * Remove Assignment.
     */
    public function removeAssignment($agentId, $customerId)
    {
        AgentCustomer::where('agent_id', $agentId)->where('customer_id', $customerId)->delete();
        return redirect()->back()->with('success', 'تم فك الربط بنجاح');
    }
}
