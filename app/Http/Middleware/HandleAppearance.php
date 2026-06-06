<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force light mode on public pages
        $isPublic = $request->path() === '/' || str_starts_with($request->path(), 'shops');

        View::share('appearance', $isPublic ? 'light' : $request->cookie('appearance') ?? 'light');

        return $next($request);
    }
}
