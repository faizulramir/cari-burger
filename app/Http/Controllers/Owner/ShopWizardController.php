<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class ShopWizardController extends Controller
{
    /**
     * Handle shop creation from the onboarding wizard.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'phone' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:1000',
            'opening_hours' => 'nullable|array',
        ]);

        // Update user role to owner
        $request->user()->update(['role' => 'owner']);

        // Create the shop
        Shop::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'address' => $validated['address'],
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
            'phone' => $validated['phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'opening_hours' => $validated['opening_hours'] ?? [],
            'status' => 'pending',
        ]);

        return Redirect::route('owner.dashboard')
            ->with('success', "{$validated['name']} has been created! It'll be reviewed before going live.");
    }
}
