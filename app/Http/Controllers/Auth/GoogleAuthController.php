<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController
{
    /**
     * Redirect the user to Google's OAuth page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $adminEmail = env('ADMIN_EMAIL');

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
                'role' => $adminEmail && strtolower($googleUser->getEmail()) === strtolower($adminEmail) ? 'admin' : 'user',
                'password' => bcrypt(\Illuminate\Support\Str::random(32)),
            ]
        );

        // Always update role on login in case admin email was added later
        if ($adminEmail && strtolower($googleUser->getEmail()) === strtolower($adminEmail) && ! $user->isAdmin()) {
            $user->update(['role' => 'admin']);
        }

        $isNewUser = $user->wasRecentlyCreated;

        Auth::login($user, true);

        // New non-admin users go to onboarding
        if ($isNewUser && ! $user->isAdmin()) {
            return redirect()->route('onboarding');
        }

        return redirect()->intended(
            $user->isAdmin() ? '/admin' : '/dashboard'
        );
    }
}
