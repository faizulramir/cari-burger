import { Head, Link, usePage } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { useEffect, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fix default marker icons in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const openIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const closedIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

const closingSoonIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:#f59e0b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

interface ShopMarker {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    status: 'open' | 'closed' | 'closing_soon';
    image: string | null;
    rating: number;
}

function getStatusIcon(status: string) {
    if (status === 'open') return openIcon;
    if (status === 'closing_soon') return closingSoonIcon;
    return closedIcon;
}

function getStatusColor(status: string) {
    if (status === 'open') return 'bg-green-500';
    if (status === 'closing_soon') return 'bg-amber-500';
    return 'bg-red-500';
}

function getStatusLabel(status: string) {
    if (status === 'open') return 'Open';
    if (status === 'closing_soon') return 'Closing Soon';
    return 'Closed';
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function Welcome() {
    const { auth } = usePage().props;
    const user = auth.user as any;
    const [shops, setShops] = useState<ShopMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [distance, setDistance] = useState(10);
    const [mapCenter, setMapCenter] = useState<[number, number]>([3.139, 101.6869]); // KL default
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showDistanceModal, setShowDistanceModal] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Get user location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    setUserLocation(loc);
                    setMapCenter(loc);
                },
                () => { /* ignore */ },
                { enableHighAccuracy: false, timeout: 5000 }
            );
        }
    }, []);

    const fetchShops = useCallback(async (q?: string, lat?: number, lng?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (q) params.set('search', q);
            if (lat && lng) {
                params.set('lat', String(lat));
                params.set('lng', String(lng));
                params.set('distance', String(distance));
            }
            const res = await fetch(`/api/shops/map?${params.toString()}`);
            const data = await res.json();
            setShops(data);
        } catch (e) {
            console.error('Failed to fetch shops', e);
        } finally {
            setLoading(false);
        }
    }, [distance]);

    useEffect(() => {
        fetchShops(undefined, mapCenter[0], mapCenter[1]);
    }, []);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchShops(value, mapCenter[0], mapCenter[1]);
        }, 300);
    }, [fetchShops, mapCenter]);

    const loginUrl = '/login';
    const registerUrl = '/register';

    return (
        <>
            <Head title="Cariburger - Discover Burger Shops" />
            <div className="relative h-screen w-screen overflow-hidden bg-stone-900">
                {/* Map */}
                <div className="absolute inset-0 z-0">
                    {loading && (
                        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/20">
                            <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-xl backdrop-blur">
                                <Spinner className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    )}
                    <MapContainer
                        center={mapCenter}
                        zoom={14}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={mapCenter} zoom={14} />
                        {shops.map((shop) => (
                            <Marker
                                key={shop.id}
                                position={[shop.lat, shop.lng]}
                                icon={getStatusIcon(shop.status)}
                            >
                                <Popup>
                                    <div className="min-w-[180px]">
                                        {shop.image && (
                                            <img
                                                src={`/storage/${shop.image}`}
                                                alt={shop.name}
                                                className="mb-2 h-24 w-full rounded-lg object-cover"
                                            />
                                        )}
                                        <h3 className="font-semibold text-sm">{shop.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{shop.address}</p>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor(shop.status)}`} />
                                            <span className="text-xs font-medium">{getStatusLabel(shop.status)}</span>
                                            {shop.rating > 0 && (
                                                <span className="text-xs text-amber-500 ml-auto">
                                                    {'★'.repeat(Math.round(shop.rating))}{'☆'.repeat(5 - Math.round(shop.rating))}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/shops/${shop.id}`}
                                            className="mt-2 inline-block w-full rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Top bar overlay */}
                <header className="absolute top-0 left-0 right-0 z-10 px-3 pt-3 sm:px-4 sm:pt-4">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
                        {/* Logo + Search row — desktop: logo+search, mobile: logo+legend */}
                        <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-1">
                            <Link href="/" className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-stone-800 shadow-lg backdrop-blur sm:gap-2 sm:px-4 sm:py-2.5">
                                <span className="text-xl sm:text-2xl">🍔</span>
                                <span className="text-base font-bold text-[#c2410c] sm:text-lg">Cariburger</span>
                            </Link>

                            {/* Search — hidden on mobile (moved to bottom) */}
                            <div className="hidden sm:block flex-1 sm:max-w-md">
                                <Input
                                    placeholder="Search burger shops..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="h-11 rounded-xl border-0 bg-white/95 text-sm text-stone-800 placeholder:text-stone-400 shadow-lg backdrop-blur"
                                />
                            </div>

                            {/* Legend — mobile only, in top bar */}
                            <div className="flex flex-1 items-center justify-end gap-3 sm:hidden">
                                <div className="flex items-center gap-1.5 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-lg backdrop-blur">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-medium text-stone-700">Open</span>
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-medium text-stone-700">Soon</span>
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-medium text-stone-700">Closed</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls row — desktop: slider + auth, mobile: auth only */}
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            {/* Distance slider — desktop horizontal */}
                            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-stone-700 shadow-lg backdrop-blur sm:gap-2 sm:px-4">
                                <span className="text-xs font-medium whitespace-nowrap">{distance}km</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={distance}
                                    onChange={(e) => {
                                        setDistance(Number(e.target.value));
                                        fetchShops(search || undefined, mapCenter[0], mapCenter[1]);
                                    }}
                                    className="h-1.5 w-20 accent-primary"
                                />
                            </div>

                            {/* Auth buttons */}
                            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                                {user ? (
                                    <Link
                                        href={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/dashboard'}
                                        className="whitespace-nowrap rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-lg backdrop-blur hover:bg-white sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        {user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'My Shop' : 'Dashboard'}
                                    </Link>
                                ) : (
                                    <>
                                        <a
                                            href="/auth/google/redirect"
                                            className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-lg backdrop-blur hover:bg-white transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                                        >
                                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            <span className="hidden sm:inline">Google</span>
                                        </a>
                                        <Link
                                            href={loginUrl}
                                            className="whitespace-nowrap rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-lg backdrop-blur hover:bg-white sm:px-4 sm:py-2.5 sm:text-sm"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile search + distance button */}
                <div className="absolute bottom-3 left-2 right-2 z-10 flex items-center gap-2 sm:hidden">
                    <Input
                        placeholder="🔍 Find a burger shop..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-10 flex-1 rounded-xl border-0 bg-white/95 text-sm text-stone-800 placeholder:text-stone-400 shadow-lg backdrop-blur"
                    />
                    <button
                        onClick={() => setShowDistanceModal(true)}
                        className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-white/95 px-3 text-xs font-medium text-stone-700 shadow-lg backdrop-blur"
                    >
                        📏 {distance}km
                    </button>
                </div>

                {/* Distance modal overlay */}
                {showDistanceModal && (
                    <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/40" onClick={() => setShowDistanceModal(false)}>
                        <div
                            className="w-full max-w-lg rounded-t-2xl bg-white px-6 pt-6 pb-8 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-stone-800">Filter by Distance</h3>
                                <button onClick={() => setShowDistanceModal(false)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
                            </div>

                            <div className="mb-4 flex items-baseline justify-center gap-2">
                                <span className="text-4xl font-extrabold text-primary">{distance}</span>
                                <span className="text-lg font-semibold text-stone-500">km</span>
                            </div>

                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={distance}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                className="mb-4 h-2 w-full accent-primary"
                            />

                            <div className="flex justify-between text-xs text-stone-400 px-1">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>

                            <Button
                                onClick={() => {
                                    setShowDistanceModal(false);
                                    fetchShops(search || undefined, mapCenter[0], mapCenter[1]);
                                }}
                                className="mt-5 w-full rounded-xl"
                            >
                                Apply {distance}km
                            </Button>
                        </div>
                    </div>
                )}

                {/* Legend — desktop only */}
                <div className="absolute bottom-6 left-6 z-10 hidden sm:block">
                    <div className="rounded-2xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-green-500 shadow-sm" />
                                <span className="text-xs font-medium text-stone-700">Open</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
                                <span className="text-xs font-medium text-stone-700">Closing Soon</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-red-500 shadow-sm" />
                                <span className="text-xs font-medium text-stone-700">Closed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {!loading && shops.length === 0 && (
                    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-2xl bg-white/95 px-6 py-4 text-center shadow-lg backdrop-blur">
                        <p className="text-sm font-medium text-muted-foreground">
                            No burger shops found in this area. Try a different search or zoom out.
                        </p>
                    </div>
                )}
            </div>
        </>
 