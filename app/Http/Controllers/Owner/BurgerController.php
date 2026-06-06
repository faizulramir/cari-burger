<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Burger;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;

class BurgerController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('burgers', 'public');
        }

        $validated['shop_id'] = $shop->id;

        Burger::create($validated);

        return Redirect::back()->with('success', 'Burger added to menu!');
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
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($burger->image) {
                Storage::disk('public')->delete($burger->image);
            }
            $validated['image'] = $request->file('image')->store('burgers', 'public');
        }

        $burger->update($validated);

        return Redirect::back()->with('success', 'Burger updated!');
    }

    public function destroy(Burger $burger): RedirectResponse
    {
        $shop = Shop::where('user_id', auth()->id())->firstOrFail();
        if ($burger->shop_id !== $shop->id) {
            abort(403);
        }

        if ($burger->image) {
            Storage::disk('public')->delete($burger->image);
        }

        $burger->delete();

        return Redirect::back()->with('success', 'Burger removed from menu.');
    }
}
