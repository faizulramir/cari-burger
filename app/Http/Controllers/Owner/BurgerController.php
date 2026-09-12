<?php

namespace App\Http\Controllers\Owner;

use App\Concerns\StoresImages;
use App\Http\Controllers\Controller;
use App\Models\Burger;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class BurgerController extends Controller
{
    use StoresImages;

    public function store(Request $request): RedirectResponse
    {
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0|max:9999',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeImage($request->file('image'), 'burgers');
        }

        $validated['shop_id'] = $shop->id;
        $validated['status'] = 'pending';

        Burger::create($validated);

        return Redirect::back()->with('success', 'Burger added! Pending admin approval.');
    }

    public function update(Request $request, Burger $burger): RedirectResponse
    {
        // Owner can only update their own shop's burgers
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();
        if ($burger->shop_id !== $shop->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0|max:9999',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $this->deleteImage($burger->image);
            $validated['image'] = $this->storeImage($request->file('image'), 'burgers');
        }

        // Any edit requires re-approval
        $validated['status'] = 'pending';

        $burger->update($validated);

        return Redirect::back()->with('success', 'Burger updated! Pending re-approval.');
    }

    public function destroy(Burger $burger): RedirectResponse
    {
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();
        if ($burger->shop_id !== $shop->id) {
            abort(403);
        }

        $this->deleteImage($burger->image);

        $burger->delete();

        return Redirect::back()->with('success', 'Burger removed from menu.');
    }
}
