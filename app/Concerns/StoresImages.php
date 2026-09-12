<?php

namespace App\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait StoresImages
{
    /**
     * Store an uploaded image with compression/resize.
     * Uses S3 disk when AWS_BUCKET is configured, otherwise public disk.
     */
    protected function storeImage(UploadedFile $file, string $dir, int $maxDim = 1200, int $quality = 80): string
    {
        $disk = $this->imageDisk();
        $processed = $this->compressImage($file, $maxDim, $quality);
        $ext = $processed['ext'];
        $filename = uniqid('', true).'.'.$ext;
        $path = trim($dir, '/').'/'.$filename;
        Storage::disk($disk)->put($path, $processed['contents'], 'public');

        return $path;
    }

    protected function deleteImage(?string $path): void
    {
        if (! $path) {
            return;
        }
        foreach (['public', 's3'] as $disk) {
            try {
                if (Storage::disk($disk)->exists($path)) {
                    Storage::disk($disk)->delete($path);
                }
            } catch (\Throwable) {
                // ignore missing disk config
            }
        }
    }

    protected function imageDisk(): string
    {
        return filled(env('AWS_BUCKET')) ? 's3' : 'public';
    }

    public static function imageUrl(?string $path): string
    {
        if (! $path) {
            return '';
        }
        if (str_starts_with($path, 'http')) {
            return $path;
        }
        try {
            if (filled(env('AWS_BUCKET')) && Storage::disk('s3')->exists($path)) {
                return Storage::disk('s3')->url($path);
            }
        } catch (\Throwable) {
        }

        return '/storage/'.$path;
    }

    /**
     * @return array{contents: string, ext: string}
     */
    private function compressImage(UploadedFile $file, int $maxDim, int $quality): array
    {
        $mime = $file->getMimeType() ?: 'image/jpeg';
        $raw = file_get_contents($file->getRealPath());
        if ($raw === false) {
            throw new \RuntimeException('Unable to read uploaded image.');
        }

        // Try GD; fall back to raw bytes if unavailable / unsupported.
        if (! function_exists('imagecreatefromstring')) {
            return ['contents' => $raw, 'ext' => $file->getClientOriginalExtension() ?: 'jpg'];
        }

        $src = @imagecreatefromstring($raw);
        if ($src === false) {
            return ['contents' => $raw, 'ext' => $file->getClientOriginalExtension() ?: 'jpg'];
        }

        $w = imagesx($src);
        $h = imagesy($src);
        $scale = min(1, $maxDim / max(1, max($w, $h)));
        $nw = (int) max(1, round($w * $scale));
        $nh = (int) max(1, round($h * $scale));

        $dst = imagecreatetruecolor($nw, $nh);
        // Preserve transparency for PNG/WebP
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

        ob_start();
        $isPng = str_contains($mime, 'png');
        $isWebp = str_contains($mime, 'webp');
        if ($isPng) {
            // PNG compression 0-9 (map quality 0-100 -> 9-0)
            imagepng($dst, null, (int) round((100 - $quality) / 100 * 9));
            $ext = 'png';
        } elseif ($isWebp && function_exists('imagewebp')) {
            imagewebp($dst, null, $quality);
            $ext = 'webp';
        } else {
            imagejpeg($dst, null, $quality);
            $ext = 'jpg';
        }
        $contents = (string) ob_get_clean();
        imagedestroy($src);
        imagedestroy($dst);

        return ['contents' => $contents, 'ext' => $ext];
    }
}
