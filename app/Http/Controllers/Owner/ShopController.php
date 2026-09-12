<?php

namespace App\Http\Controllers\Owner;

use App\Concerns\StoresImages;
use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    use StoresImages;

    public function create(): Response
    {
        $existing = Shop::where('user_id', auth()->id())->first();

        if ($existing) {
            return Redirect::route('owner.shop.edit');
        }

        return Inertia::render('owner/shop-form', [
            'shop' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'required|string|max:500',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'phone' => 'nullable|string|max:20',
            'opening_hours' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeImage($request->file('image'), 'shops');
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        Shop::create($validated);

        return Redirect::route('owner.shop.edit')->with('success', 'Shop created! Submit for approval when ready.');
    }

    public function edit(): Response
    {
        $shop = Shop::where('user_id', auth()->id())->first();

        if (! $shop) {
            return Redirect::route('owner.shop.create');
        }

        $shop->load('burgers');

        return Inertia::render('owner/shop-form', [
            'shop' => $shop->only([
                'id', 'name', 'description', 'address', 'lat', 'lng',
                'opening_hours', 'phone', 'image', 'status',
            ]),
            'burgers' => $shop->burgers,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'required|string|max:500',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'phone' => 'nullable|string|max:20',
            'opening_hours' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $this->deleteImage($shop->image);
            $validated['image'] = $this->storeImage($request->file('image'), 'shops');
        }

        // Rejected shops go back to pending on resubmit.
        if ($shop->status === 'rejected') {
            $validated['status'] = 'pending';
        }

        $shop->update($validated);

        $msg = $shop->wasChanged('status') ? 'Shop resubmitted for approval!' : 'Shop updated!';

        return Redirect::back()->with('success', $msg);
    }
}
