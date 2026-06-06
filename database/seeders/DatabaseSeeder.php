<?php

namespace Database\Seeders;

use App\Models\Burger;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@Cari Burger.test',
            'role' => 'admin',
        ]);

        // Sample owner
        $owner = User::factory()->create([
            'name' => 'Ahmad Burger',
            'email' => 'owner@Cari Burger.test',
            'role' => 'owner',
        ]);

        // Sample shops around KL
        $shops = [
            [
                'user_id' => $owner->id,
                'name' => 'Burger Lab KL',
                'description' => 'Gourmet charcoal-grilled burgers with homemade sauces. Famous for our double patty smash burgers and loaded fries.',
                'address' => '25, Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur',
                'lat' => 3.1310,
                'lng' => 101.6706,
                'phone' => '012-345 6789',
                'opening_hours' => [
                    'monday' => ['open' => '11:00', 'close' => '22:00'],
                    'tuesday' => ['open' => '11:00', 'close' => '22:00'],
                    'wednesday' => ['open' => '11:00', 'close' => '22:00'],
                    'thursday' => ['open' => '11:00', 'close' => '23:00'],
                    'friday' => ['open' => '11:00', 'close' => '23:00'],
                    'saturday' => ['open' => '10:00', 'close' => '23:00'],
                    'sunday' => ['open' => '10:00', 'close' => '22:00'],
                ],
                'status' => 'approved',
            ],
            [
                'user_id' => $owner->id,
                'name' => 'myBurgerLab Seapark',
                'description' => 'Legendary burger joint known for their charcoal buns and creative burger combinations. Great vibe for hangouts.',
                'address' => '14, Jalan 21/22, Sea Park, 46300 Petaling Jaya, Selangor',
                'lat' => 3.1095,
                'lng' => 101.6238,
                'phone' => '017-876 5432',
                'opening_hours' => [
                    'monday' => ['open' => '12:00', 'close' => '22:30'],
                    'tuesday' => ['open' => '12:00', 'close' => '22:30'],
                    'wednesday' => ['open' => '12:00', 'close' => '22:30'],
                    'thursday' => ['open' => '12:00', 'close' => '23:00'],
                    'friday' => ['open' => '12:00', 'close' => '23:00'],
                    'saturday' => ['open' => '11:00', 'close' => '23:00'],
                    'sunday' => ['open' => '11:00', 'close' => '22:30'],
                ],
                'status' => 'approved',
            ],
            [
                'user_id' => $owner->id,
                'name' => 'KGB Burgers TTDI',
                'description' => 'Killer Gourmet Burgers! Hand-pressed patties, brioche buns, and bold flavors. The nacho burger is a must-try.',
                'address' => '58, Jalan Datuk Sulaiman, TTDI, 60000 Kuala Lumpur',
                'lat' => 3.1378,
                'lng' => 101.6323,
                'phone' => '011-2345 6789',
                'opening_hours' => [
                    'monday' => ['open' => '12:00', 'close' => '21:30'],
                    'tuesday' => ['open' => '12:00', 'close' => '21:30'],
                    'wednesday' => ['open' => '12:00', 'close' => '21:30'],
                    'thursday' => ['open' => '12:00', 'close' => '22:00'],
                    'friday' => ['open' => '12:00', 'close' => '22:00'],
                    'saturday' => ['open' => '11:00', 'close' => '22:00'],
                    'sunday' => ['open' => '11:00', 'close' => '21:30'],
                ],
                'status' => 'approved',
            ],
            [
                'user_id' => $owner->id,
                'name' => 'Woodfire Burger',
                'description' => 'Wood-fired burgers with smoky flavor. Premium wagyu patties and artisan buns baked fresh daily.',
                'address' => '88, Jalan Ampang, Kampung Baru, 50450 Kuala Lumpur',
                'lat' => 3.1605,
                'lng' => 101.7112,
                'phone' => '019-987 6543',
                'opening_hours' => [
                    'tuesday' => ['open' => '17:00', 'close' => '23:00'],
                    'wednesday' => ['open' => '17:00', 'close' => '23:00'],
                    'thursday' => ['open' => '17:00', 'close' => '23:00'],
                    'friday' => ['open' => '17:00', 'close' => '00:00'],
                    'saturday' => ['open' => '12:00', 'close' => '00:00'],
                    'sunday' => ['open' => '12:00', 'close' => '22:00'],
                ],
                'status' => 'approved',
            ],
            [
                'user_id' => $owner->id,
                'name' => 'Spade\'s Burger',
                'description' => 'Homegrown Penang burger brand now in KL. Famous for their pork burgers with homemade mushroom sauce.',
                'address' => '55, Jalan SS 15/4B, SS15, 47500 Subang Jaya, Selangor',
                'lat' => 3.0765,
                'lng' => 101.5895,
                'phone' => '016-543 2109',
                'opening_hours' => [
                    'monday' => ['open' => '11:30', 'close' => '21:00'],
                    'tuesday' => ['open' => '11:30', 'close' => '21:00'],
                    'thursday' => ['open' => '11:30', 'close' => '21:00'],
                    'friday' => ['open' => '11:30', 'close' => '22:00'],
                    'saturday' => ['open' => '11:00', 'close' => '22:00'],
                    'sunday' => ['open' => '11:00', 'close' => '21:00'],
                ],
                'status' => 'approved',
            ],
        ];

        foreach ($shops as $shopData) {
            $shop = Shop::create($shopData);

            // Add burgers to each shop
            $burgers = [
                ['name' => 'Classic Cheeseburger', 'description' => 'Beef patty, cheddar, lettuce, tomato, special sauce', 'price' => 14.90],
                ['name' => 'Double Smash Burger', 'description' => 'Two smashed beef patties, American cheese, grilled onions', 'price' => 22.90],
                ['name' => 'BBQ Bacon Burger', 'description' => 'Beef patty, crispy bacon, BBQ sauce, onion rings', 'price' => 19.90],
                ['name' => 'Spicy Chicken Burger', 'description' => 'Crispy chicken thigh, spicy mayo, slaw', 'price' => 16.90],
                ['name' => 'Mushroom Swiss Burger', 'description' => 'Beef patty, sauteed mushrooms, Swiss cheese, truffle mayo', 'price' => 21.90],
            ];

            // Randomly pick 3-5 burgers per shop
            $count = rand(3, 5);
            $picked = collect($burgers)->shuffle()->take($count);

            foreach ($picked as $burger) {
                Burger::create(array_merge($burger, ['shop_id' => $shop->id]));
            }
        }
    }
}
