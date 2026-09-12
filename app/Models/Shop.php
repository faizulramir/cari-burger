<?php

namespace App\Models;

use Carbon\Carbon;
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

    public function approvedBurgers(): HasMany
    {
        return $this->hasMany(Burger::class)->where('status', 'approved');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
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
     * Uses Asia/Kuala_Lumpur timezone and handles overnight ranges (e.g. 18:00-02:00).
     */
    public function isOpen(?\DateTimeInterface $at = null): bool
    {
        if (! $this->opening_hours) {
            return false;
        }

        $now = $at ? Carbon::parse($at)->setTimezone('Asia/Kuala_Lumpur') : now('Asia/Kuala_Lumpur');
        $day = strtolower($now->format('l')); // monday, tuesday, etc.
        $currentMinutes = $now->hour * 60 + $now->minute;

        // Check today's hours plus yesterday's overnight spill-over.
        foreach ([$day, strtolower($now->copy()->subDay()->format('l'))] as $checkDay) {
            $hours = $this->opening_hours[$checkDay] ?? null;
            if (! $hours || empty($hours['open']) || empty($hours['close'])) {
                continue;
            }
            [$open, $close] = [$this->toMinutes($hours['open']), $this->toMinutes($hours['close'])];
            if ($open === null || $close === null) {
                continue;
            }
            if ($close < $open) {
                // Overnight range: open day 18:00 -> next day 02:00
                if ($checkDay === $day && $currentMinutes >= $open) {
                    return true;
                }
                if ($checkDay !== $day && $currentMinutes <= $close) {
                    return true;
                }
            } elseif ($checkDay === $day && $currentMinutes >= $open && $currentMinutes <= $close) {
                return true;
            }
        }

        return false;
    }

    private function toMinutes(string $time): ?int
    {
        if (! preg_match('/^(\d{1,2}):(\d{2})/', trim($time), $m)) {
            return null;
        }
        $h = (int) $m[1];
        $min = (int) $m[2];
        if ($h < 0 || $h > 23 || $min < 0 || $min > 59) {
            return null;
        }

        return $h * 60 + $min;
    }

    /**
     * Returns 'open', 'closed', or 'closing_soon'.
     */
    public function statusLabel(): string
    {
        if (! $this->isOpen()) {
            return 'closed';
        }

        $now = now('Asia/Kuala_Lumpur');
        $day = strtolower($now->format('l'));
        $closeTime = $this->opening_hours[$day]['close'] ?? null;

        if ($closeTime) {
            $close = $now->copy()->setTimeFromTimeString($closeTime);
            // Overnight close belongs to next day
            if ($close->lessThan($now->copy()->setTimeFromTimeString($this->opening_hours[$day]['open'] ?? '00:00'))) {
                $close->addDay();
            }
            $diffInMinutes = $now->diffInMinutes($close, false);

            if ($diffInMinutes <= 60 && $diffInMinutes >= 0) {
                return 'closing_soon';
            }
        }

        return 'open';
    }
}
