<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Burger;
use App\Models\Comment;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $pendingShops = Shop::where('status', 'pending')->count();
        $pendingBurgers = Burger::where('status', 'pending')->count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_shops' => Shop::count(),
                'pending_shops' => $pendingShops,
                'approved_shops' => Shop::where('status', 'approved')->count(),
                'rejected_shops' => Shop::where('status', 'rejected')->count(),
                'total_burgers' => Burger::count(),
                'pending_burgers' => $pendingBurgers,
                'approved_burgers' => Burger::where('status', 'approved')->count(),
                'total_users' => User::count(),
                'total_owners' => User::where('role', 'owner')->count(),
                'total_comments' => Comment::count(),
                'avg_rating' => round((float) Comment::avg('rating'), 1),
                'open_now' => Shop::approved()->get()->filter->isOpen()->count(),
            ],
            'recent_shops' => Shop::with('owner:id,name')->latest()->limit(5)->get(),
            'recent_comments' => Comment::with(['user:id,name', 'shop:id,name'])->latest()->limit(5)->get(),
            'top_shops' => Shop::approved()
                ->withAvg('comments as avg_rating', 'rating')
                ->withCount('comments')
                ->orderByDesc('avg_rating')
                ->limit(5)
                ->get(['id', 'name']),
            'shops_by_day' => Shop::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', now()->subDays(14))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ]);
    }

    /**
     * List all shops for approval management.
     */
    public function shops(Request $request): Response
    {
        $shops = Shop::query()
            ->with('owner:id,name,email')
            ->withCount(['burgers', 'comments'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

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

    public function burgers(Request $request): Response
    {
        $burgers = Burger::query()
            ->with('shop:id,name')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/burgers', [
            'burgers' => $burgers,
            'filters' => $request->only('status'),
            'counts' => [
                'pending' => Burger::where('status', 'pending')->count(),
                'approved' => Burger::where('status', 'approved')->count(),
                'rejected' => Burger::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function approveBurger(Burger $burger): RedirectResponse
    {
        $burger->update(['status' => 'approved']);

        return Redirect::back()->with('success', "{$burger->name} has been approved.");
    }

    public function rejectBurger(Burger $burger): RedirectResponse
    {
        $burger->update(['status' => 'rejected']);

        return Redirect::back()->with('success', "{$burger->name} has been rejected.");
    }

    public function comments(Request $request): Response
    {
        $comments = Comment::query()
            ->with(['user:id,name,email', 'shop:id,name'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/comments', [
            'comments' => $comments,
        ]);
    }

    public function destroyComment(Comment $comment): RedirectResponse
    {
        $comment->delete();

        return Redirect::back()->with('success', 'Comment deleted.');
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
            ->paginate(20)
            ->withQueryString();

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
