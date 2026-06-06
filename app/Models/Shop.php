<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shop extends Model
{
    protected $appends = ['average_rating', 'is_open', 'status_label'];

    protected $fillable = [
        'user_id', 'name', 'description', 'address',
        'lat', 'lng', 'opening_hours', 'phone', 'image', 'status',
    ];

    protected function casts(): array
    {
        return [
            'opening_hours' => 'array',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function burgers(): HasMany
    {
        return $this->hasMany(Burger::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function averageRating(): float
    {
        return (float) $this->comments()->avg('rating') ?? 0;
    }

    public function getAverageRatingAttribute(): float
    {
        if (! $this->relationLoaded('comments')) {
            return (float) ($this->comments()->avg('rating') ?? 0);
        }

        return (float) ($this->comments->avg('rating') ?? 0);
    }

    public function getIsOpenAttribute(): bool
    {
        return $this->isOpen();
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->statusLabel();
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Determine if the shop is currently open based on opening_hours.
     */
    public function isOpen(): bool
    {
        if (! $this->opening_hours) {
            return false;
        }

        $now = now();
        $day = strtolower($now->format('l')); // monday, tuesday, etc.
        $currentTime = $now->format('H:i');

        $todayHours = $this->opening_hours[$day] ?? null;

        if (! $todayHours || empty($todayHours['open']) || empty($todayHours['close'])) {
            return false;
        }

        return $currentTime >= $todayHours['open'] && $currentTime <= $todayHours['close'];
    }

    /**
     * Returns 'open', 'closed', or 'closing_soon'.
     */
    public function statusLabel(): string
    {
        if (! $this->isOpen()) {
            return 'closed';
        }

        $day = strtolower(now()->format('l'));
        $currentTime = now();
        $closeTime = $this->opening_hours[$day]['close'] ?? null;

        if ($closeTime) {
            $close = now()->setTimeFromTimeString($closeTime);
            $diffInMinutes = $currentTime->diffInMinutes($close, false);

            if ($diffInMinutes <= 60 && $diffInMinutes >= 0) {
                return 'closing_soon';
            }
        }

        return 'open';
    }
}
