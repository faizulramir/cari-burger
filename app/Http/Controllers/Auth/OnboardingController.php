<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the role selection page.
     */
    public function index(): Response
    {
        return Inertia::render('onboarding');
    }

    /**
     * Store the user's chosen role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:user,owner',
        ]);

        $request->user()->update(['role' => $validated['role']]);

        return redirect()->intended(
            $validated['role'] === 'owner' ? '/owner' : '/dashboard'
        );
    }
}
