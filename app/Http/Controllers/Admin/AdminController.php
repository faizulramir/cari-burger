<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * List all shops for approval management.
     */
    public function shops(Request $request): Response
    {
        $shops = Shop::query()
            ->with('owner:id,name,email')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/shops', [
            'shops' => $shops,
            'filters' => $request->only('status'),
            'counts' => [
                'pending' => Shop::where('status', 'pending')->count(),
                'approved' => Shop::where('status', 'approved')->count(),
                'rejected' => Shop::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function approveShop(Shop $shop): RedirectResponse
    {
        $shop->update(['status' => 'approved']);

        return Redirect::back()->with('success', "{$shop->name} has been approved.");
    }

    public function rejectShop(Shop $shop): RedirectResponse
    {
        $shop->update(['status' => 'rejected']);

        return Redirect::back()->with('success', "{$shop->name} has been rejected.");
    }

    /**
     * List all users for management.
     */
    public function users(Request $request): Response
    {
        $users = User::query()
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => $request->only('role', 'search'),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,owner,user',
        ]);

        $user->update($validated);

        return Redirect::back()->with('success', "{$user->name}'s role updated to {$validated['role']}.");
    }
}
