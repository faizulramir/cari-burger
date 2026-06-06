<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Shop;
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
            ->withCount(['comments', 'burgers'])
            ->withAvg('comments as avg_rating', 'rating')
            ->latest()
            ->paginate(12);

        return Inertia::render('shops/index', [
            'shops' => $shops,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show a single shop detail page.
     */
    public function show(Shop $shop): Response
    {
        $shop->load(['burgers', 'comments.user']);
        $shop->append(['is_open', 'status_label', 'average_rating']);

        return Inertia::render('shops/show', [
            'shop' => $shop->only([
                'id', 'name', 'description', 'address', 'lat', 'lng',
                'opening_hours', 'phone', 'image', 'status_label', 'average_rating',
            ]),
            'burgers' => $shop->burgers,
            'comments' => $shop->comments()->with('user')->latest()->get(),
        ]);
    }

    /**
     * API endpoint for map markers.
     */
    public function mapData(Request $request): \Illuminate\Http\JsonResponse
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

        $shops = $query->get()->map(fn ($shop) => [
            'id' => $shop->id,
            'name' => $shop->name,
            'lat' => $shop->lat,
            'lng' => $shop->lng,
            'address' => $shop->address,
            'status' => $shop->statusLabel(),
            'image' => $shop->image,
            'rating' => $shop->averageRating(),
        ]);

        return response()->json($shops);
    }

    /**
     * Store a comment on a shop.
     */
    public function storeComment(Request $request, Shop $shop): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $shop->comments()->create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return Redirect::back()->with('success', 'Comment posted!');
    }
}
