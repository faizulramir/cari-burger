<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Owner\BurgerController;
use App\Http\Controllers\Owner\ShopController;
use App\Http\Controllers\Owner\ShopWizardController;
use App\Http\Controllers\ShopController as PublicShopController;
use Illuminate\Support\Facades\Route;

// ── Public ──
Route::inertia('/', 'welcome')->name('home');

// Shops — browse
Route::get('/shops', [PublicShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{shop}', [PublicShopController::class, 'show'])->name('shops.show');
Route::get('/api/shops/map', [PublicShopController::class, 'mapData'])->name('shops.map');
Route::get('/api/shops/{shop}', [PublicShopController::class, 'apiShow'])->name('shops.api-show');

// ── Google OAuth ──
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

// ── Authenticated ──
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Onboarding (first-time role selection)
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::post('/onboarding/choose', [OnboardingController::class, 'store'])->name('onboarding.choose');

    // Shop wizard (from onboarding "Burger Shop Owner" choice)
    Route::inertia('/onboarding/wizard', 'onboarding/wizard')->name('onboarding.wizard');
    Route::post('/owner/wizard/create', [ShopWizardController::class, 'store'])->name('owner.wizard.create');

    // Comments (throttled + spam-guarded in controller)
    Route::post('/shops/{shop}/comments', [PublicShopController::class, 'storeComment'])
        ->middleware('throttle:20,1')
        ->name('comments.store');
    Route::delete('/comments/{comment}', [PublicShopController::class, 'destroyComment'])->name('comments.destroy');

    // Favorites
    Route::post('/shops/{shop}/favorite', [PublicShopController::class, 'toggleFavorite'])->name('shops.favorite');
    Route::get('/favorites', [PublicShopController::class, 'favorites'])->name('shops.favorites');
});

// ── Owner ──
Route::middleware(['auth', 'verified', 'role:owner,admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::inertia('/', 'owner/dashboard')->name('dashboard');

    // Shop CRUD
    Route::get('/shop/create', [ShopController::class, 'create'])->name('shop.create');
    Route::post('/shop', [ShopController::class, 'store'])->name('shop.store');
    Route::get('/shop/edit', [ShopController::class, 'edit'])->name('shop.edit');
    Route::patch('/shop', [ShopController::class, 'update'])->name('shop.update');

    // Burger CRUD (burgers require admin approval)
    Route::post('/burgers', [BurgerController::class, 'store'])->name('burgers.store');
    Route::patch('/burgers/{burger}', [BurgerController::class, 'update'])->name('burgers.update');
    Route::delete('/burgers/{burger}', [BurgerController::class, 'destroy'])->name('burgers.destroy');
});

// ── Admin ──
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

    // Shop approval
    Route::get('/shops', [AdminController::class, 'shops'])->name('shops');
    Route::patch('/shops/{shop}/approve', [AdminController::class, 'approveShop'])->name('shops.approve');
    Route::patch('/shops/{shop}/reject', [AdminController::class, 'rejectShop'])->name('shops.reject');

    // Burger approval
    Route::get('/burgers', [AdminController::class, 'burgers'])->name('burgers');
    Route::patch('/burgers/{burger}/approve', [AdminController::class, 'approveBurger'])->name('burgers.approve');
    Route::patch('/burgers/{burger}/reject', [AdminController::class, 'rejectBurger'])->name('burgers.reject');

    // Comment moderation
    Route::get('/comments', [AdminController::class, 'comments'])->name('comments');
    Route::delete('/comments/{comment}', [AdminController::class, 'destroyComment'])->name('comments.destroy');

    // User management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::patch('/users/{user}/role', [AdminController::class, 'updateRole'])->name('users.role');
});

require __DIR__.'/settings.php';
