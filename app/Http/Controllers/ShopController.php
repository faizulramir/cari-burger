<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    /**
     * List approved shops (browse page).
     */
    public function index(Request $request): Response
    {
        $shops = Shop::approved()
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->withCount(['approvedBurgers as burgers_count', 'comments', 'favorites'])
            ->withAvg('comments as avg_rating', 'rating')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // open_now can't be done in SQL (hours are JSON) — filter the paginated collection
        // and price filter via approved burgers.
        if ($request->boolean('open_now') || $request->filled('max_price') || $request->filled('min_rating')) {
            $collection = $shops->getCollection()
                ->when($request->boolean('open_now'), fn ($c) => $c->filter->isOpen())
                ->when($request->filled('max_price'), function ($c) use ($request) {
                    $max = (float) $request->max_price;

                    return $c->filter(fn ($s) => $s->approvedBurgers()->where('price', '<=', $max)->exists());
                })
                ->when($request->filled('min_rating'), fn ($c) => $c->filter(fn ($s) => ($s->avg_rating ?? 0) >= (float) $request->min_rating));
            $shops->setCollection($collection);
        }

        $favorites = $request->user()?->favorites()->pluck('shop_id')->all() ?? [];

        return Inertia::render('shops/index', [
            'shops' => $shops,
            'filters' => $request->only('search', 'open_now', 'max_price', 'min_rating'),
            'favorites' => $favorites,
        ]);
    }

    /**
     * Show a single shop detail page. Only approved shops are public,
     * unless the viewer is the owner or an admin.
     */
    public function show(Request $request, Shop $shop): Response
    {
        $user = $request->user();
        $isPrivileged = $user && ($user->isAdmin() || $shop->user_id === $user->id);

        if ($shop->status !== 'approved' && ! $isPrivileged) {
            abort(404);
        }

        $shop->load(['approvedBurgers', 'comments.user']);
        $shop->append(['is_open', 'status_label', 'average_rating']);

        $isFavorited = $user ? $shop->favorites()->where('user_id', $user->id)->exists() : false;

        return Inertia::render('shops/show', [
            'shop' => array_merge($shop->only([
                'id', 'name', 'description', 'address', 'lat', 'lng',
                'opening_hours', 'phone', 'image', 'status', 'status_label', 'average_rating',
            ]), [
                'favorites_count' => $shop->favorites()->count(),
                'is_favorited' => $isFavorited,
            ]),
            'burgers' => $shop->approvedBurgers,
            'comments' => $shop->comments()->with('user')->latest()->get(),
        ]);
    }

    /**
     * JSON detail for the shop modal. Same visibility rules as show().
     */
    public function apiShow(Request $request, Shop $shop): JsonResponse
    {
        $user = $request->user();
        $isPrivileged = $user && ($user->isAdmin() || $shop->user_id === $user->id);

        if ($shop->status !== 'approved' && ! $isPrivileged) {
            abort(404);
        }

        $shop->load(['approvedBurgers', 'comments.user']);
        $shop->append(['is_open', 'status_label', 'average_rating']);

        return response()->json([
            'shop' => array_merge($shop->only([
                'id', 'name', 'description', 'address', 'lat', 'lng',
                'opening_hours', 'phone', 'image', 'status', 'status_label', 'average_rating',
            ]), [
                'favorites_count' => $shop->favorites()->count(),
                'is_favorited' => $user ? $shop->favorites()->where('user_id', $user->id)->exists() : false,
            ]),
            'burgers' => $shop->approvedBurgers,
            'comments' => $shop->comments()->with('user:id,name,avatar')->latest()->get(),
        ]);
    }

    /**
     * API endpoint for map markers.
     */
    public function mapData(Request $request): JsonResponse
    {
        $query = Shop::approved()
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"));

        // Filter by distance if lat/lng/distance provided
        if ($request->has('lat') && $request->has('lng') && $request->has('distance')) {
            $lat = (float) $request->lat;
            $lng = (float) $request->lng;
            $radiusKm = (float) $request->distance;

            $query->whereRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) <= ?',
                [$lat, $lng, $lat, $radiusKm]
            );
        }

        if ($request->filled('max_price')) {
            $max = (float) $request->max_price;
            $query->whereHas('approvedBurgers', fn ($q) => $q->where('price', '<=', $max));
        }

        if ($request->filled('min_rating')) {
            $min = (float) $request->min_rating;
            $query->whereHas('comments', fn ($q) => $q->selectRaw('avg(rating) >= ?', [$min]), '>=', 1);
        }

        $shops = $query->with(['approvedBurgers', 'comments'])->get();

        // open_now is computed in PHP (JSON hours + timezone + overnight)
        if ($request->boolean('open_now')) {
            $shops = $shops->filter->isOpen()->values();
        }

        $result = $shops->map(fn ($shop) => [
            'id' => $shop->id,
            'name' => $shop->name,
            'lat' => $shop->lat,
            'lng' => $shop->lng,
            'address' => $shop->address,
            'status' => $shop->statusLabel(),
            'image' => $shop->image,
            'rating' => $shop->averageRating(),
            'min_price' => $shop->approvedBurgers->min('price'),
        ]);

        return response()->json($result);
    }

    /**
     * Store a comment on a shop. Throttled + spam guarded.
     */
    public function storeComment(Request $request, Shop $shop): RedirectResponse
    {
        if ($shop->status !== 'approved') {
            abort(404);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();

        // Spam guard: no duplicate message within 5 minutes, max 10/hour per user.
        $duplicate = Comment::where('user_id', $user->id)
            ->where('shop_id', $shop->id)
            ->where('message', $validated['message'])
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();
        if ($duplicate) {
            return Redirect::back()->withErrors(['message' => 'Duplicate review detected. Please wait before posting again.']);
        }

        $recentCount = Comment::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();
        if ($recentCount >= 10) {
            return Redirect::back()->withErrors(['message' => 'Too many reviews. Please try again later.']);
        }

        $shop->comments()->create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return Redirect::back()->with('success', 'Comment posted!');
    }

    public function destroyComment(Request $request, Comment $comment): RedirectResponse
    {
        $user = $request->user();
        $isShopOwner = $comment->shop->user_id === $user->id;

        if ($comment->user_id !== $user->id && ! $isShopOwner && ! $user->isAdmin()) {
            abort(403);
        }

        $comment->delete();

        return Redirect::back()->with('success', 'Review deleted.');
    }

    public function toggleFavorite(Request $request, Shop $shop): RedirectResponse
    {
        if ($shop->status !== 'approved') {
            abort(404);
        }

        $user = $request->user();
        $existing = $shop->favorites()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();

            return Redirect::back()->with('success', 'Removed from favorites.');
        }

        $shop->favorites()->create(['user_id' => $user->id]);

        return Redirect::back()->with('success', 'Saved to favorites!');
    }

    public function favorites(Request $request): Response
    {
        $shops = Shop::approved()
            ->whereHas('favorites', fn ($q) => $q->where('user_id', $request->user()->id))
            ->withCount(['approvedBurgers as burgers_count', 'comments'])
            ->withAvg('comments as avg_rating', 'rating')
            ->latest()
            ->paginate(12);

        return Inertia::render('shops/index', [
            'shops' => $shops,
            'filters' => ['favorites' => true],
            'favorites' => $request->user()->favorites()->pluck('shop_id')->all(),
        ]);
    }
}
