<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Owner\BurgerController;
use App\Http\Controllers\Owner\ShopController;
use App\Http\Controllers\Owner\ShopWizardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ShopController as PublicShopController;
use Illuminate\Support\Facades\Route;

// ── Public ──
Route::inertia('/', 'welcome')->name('home');

// Shops — browse
Route::get('/shops', [PublicShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{shop}', [PublicShopController::class, 'show'])->name('shops.show');
Route::get('/api/shops/map', [PublicShopController::class, 'mapData'])->name('shops.map');

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

    // Comments
    Route::post('/shops/{shop}/comments', [PublicShopController::class, 'storeComment'])->name('comments.store');
});

// ── Owner ──
Route::middleware(['auth', 'verified', 'role:owner,admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::inertia('/', 'owner/dashboard')->name('dashboard');

    // Shop CRUD
    Route::get('/shop/create', [ShopController::class, 'create'])->name('shop.create');
    Route::post('/shop', [ShopController::class, 'store'])->name('shop.store');
    Route::get('/shop/edit', [ShopController::class, 'edit'])->name('shop.edit');
    Route::patch('/shop', [ShopController::class, 'update'])->name('shop.update');

    // Burger CRUD
    Route::post('/burgers', [BurgerController::class, 'store'])->name('burgers.store');
    Route::patch('/burgers/{burger}', [BurgerController::class, 'update'])->name('burgers.update');
    Route::delete('/burgers/{burger}', [BurgerController::class, 'destroy'])->name('burgers.destroy');
});

// ── Admin ──
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/', 'admin/dashboard')->name('dashboard');

    // Shop approval
    Route::get('/shops', [AdminController::class, 'shops'])->name('shops');
    Route::patch('/shops/{shop}/approve', [AdminController::class, 'approveShop'])->name('shops.approve');
    Route::patch('/shops/{shop}/reject', [AdminController::class, 'rejectShop'])->name('shops.reject');

    // User management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::patch('/users/{user}/role', [AdminController::class, 'updateRole'])->name('users.role');
});

require __DIR__.'/settings.php';
