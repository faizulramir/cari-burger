<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Burger extends Model
{
    protected $fillable = [
        'shop_id', 'name', 'description', 'price', 'image', 'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
