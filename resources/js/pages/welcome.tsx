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
    const [selectedShop, setSelectedShop] = useState<ShopMarker | null>(null);
    const [locating, setLocating] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
    const distanceRef = useRef(distance);
    distanceRef.current = distance;

    // Lock body scroll on mobile
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        return () => {
            document.body.style.overflow = original;
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, []);

    // Compute stats from shops (guard against non-array)
    const stats = {
        open: Array.isArray(shops) ? shops.filter(s => s.status === 'open').length : 0,
        closed: Array.isArray(shops) ? shops.filter(s => s.status === 'closed').length : 0,
        closingSoon: Array.isArray(shops) ? shops.filter(s => s.status === 'closing_soon').length : 0,
    };

    const locateMe = () => {
        if (!('geolocation' in navigator)) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserLocation(loc);
                setMapCenter(loc);
                setLocating(false);
                fetchShops(search || undefined, loc[0], loc[1]);
            },
            (err) => {
                setLocating(false);
                console.error('Geolocation error:', err.message);
                alert('Could not get your location. Please allow location access in your browser settings.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

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

    const fetchShops = useCallback(async (q?: string, lat?: number, lng?: number, dist?: number) => {
        setLoading(true);
        try {
            const d = dist ?? distanceRef.current;
            const params = new URLSearchParams();
            if (q) params.set('search', q);
            if (lat != null && lng != null) {
                params.set('lat', String(lat));
                params.set('lng', String(lng));
                params.set('distance', String(d));
            }
            const res = await fetch(`/api/shops/map?${params.toString()}`);
            const data = await res.json();
            setShops(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch shops', e);
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, []); // no dependency needed — uses ref for distance

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
            <Head title="Cari Burger - Discover Burger Shops" />
            <div className="fixed inset-0 overflow-hidden bg-stone-900">
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
                        {/* Radius circle */}
                        <Circle
                            center={mapCenter}
                            radius={distance * 1000}
                            pathOptions={{
                                color: '#f97316',
                                fillColor: '#f97316',
                                fillOpacity: 0.08,
                                weight: 2,
                            }}
                        />
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
                                        <button
                                            onClick={() => setSelectedShop(shop)}
                                            className="mt-2 inline-block w-full rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90"
                                        >
                                            View Details
                                        </button>
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
                                <span className="text-base font-bold text-[#c2410c] sm:text-lg">Cari Burger</span>
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
                                        const val = Number(e.target.value);
                                        setDistance(val);
                                        distanceRef.current = val;
                                        fetchShops(search || undefined, mapCenter[0], mapCenter[1]);
                                    }}
                                    className="h-1.5 w-20 accent-primary"
                                />
                            </div>

                            {/* Locate me — desktop */}
                            <button
                                onClick={locateMe}
                                disabled={locating}
                                className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/95 shadow-lg backdrop-blur text-base"
                            >
                                {locating ? <Spinner className="h-3.5 w-3.5" /> : '📍'}
                            </button>

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
                                    <Link
                                        href={loginUrl}
                                        className="whitespace-nowrap rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-lg backdrop-blur hover:bg-white sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile stats + search + buttons */}
                <div className="absolute bottom-0 left-2 right-2 z-10 flex flex-col gap-2 pb-6 sm:hidden" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 16px))' }}>
                    {/* Stats panel */}
                    <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[11px] font-semibold text-stone-700">{stats.open}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-[11px] font-semibold text-stone-700">{stats.closingSoon}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-[11px] font-semibold text-stone-700">{stats.closed}</span>
                        </div>
                        <span className="ml-auto text-[10px] text-stone-400">within {distance}km</span>
                    </div>

                    {/* Search + buttons row */}
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="🔍 Find a burger shop..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="h-10 flex-1 rounded-xl border-0 bg-white/95 text-sm text-stone-800 placeholder:text-stone-400 shadow-lg backdrop-blur"
                        />
                        <button
                            onClick={() => setShowDistanceModal(true)}
                            className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-white/95 px-2.5 text-xs font-medium text-stone-700 shadow-lg backdrop-blur"
                        >
                            📏 {distance}
                        </button>
                        <button
                            onClick={locateMe}
                            disabled={locating}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 shadow-lg backdrop-blur text-lg"
                        >
                            {locating ? <Spinner className="h-4 w-4" /> : '📍'}
                        </button>
                    </div>
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

                {/* Stats — desktop bottom right */}
                <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                            <span className="font-semibold text-stone-700">{stats.open}</span>
                            <span className="text-stone-400">open</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                            <span className="font-semibold text-stone-700">{stats.closingSoon}</span>
                            <span className="text-stone-400">soon</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            <span className="font-semibold text-stone-700">{stats.closed}</span>
                            <span className="text-stone-400">closed</span>
                        </span>
                        <span className="ml-2 text-xs text-stone-400">within {distance}km</span>
                    </div>
                </div>

                {/* Shop detail modal */}
                {selectedShop && (
                    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setSelectedShop(null)}>
                        <div
                            className="w-full max-w-md rounded-t-2xl bg-white shadow-xl overflow-y-auto max-h-[80vh] sm:rounded-2xl sm:max-h-[85vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 sm:top-4 sm:right-4"
                            >
                                &times;
                            </button>

                            {/* Hero image */}
                            <div className="relative h-48 bg-stone-700">
                                {selectedShop.image ? (
                                    <img
                                        src={`/storage/${selectedShop.image}`}
                                        alt={selectedShop.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="text-5xl">🍔</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${
                                        selectedShop.status === 'open' ? 'bg-green-600' : selectedShop.status === 'closing_soon' ? 'bg-amber-600' : 'bg-red-600'
                                    }`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        {getStatusLabel(selectedShop.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <h2 className="text-xl font-bold text-stone-800">{selectedShop.name}</h2>
                                <p className="mt-1 text-sm text-stone-500">{selectedShop.address}</p>

                                {selectedShop.rating > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-amber-500 text-sm">
                                        {'★'.repeat(Math.round(selectedShop.rating))}{'☆'.repeat(5 - Math.round(selectedShop.rating))}
                                        <span className="ml-1 text-xs text-stone-400">{selectedShop.rating.toFixed(1)}</span>
                                    </div>
                                )}

                                <div className="mt-5 flex gap-3">
                                    <Link
                                        href={`/shops/${selectedShop.id}`}
                                        className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                                    >
                                        View Full Details
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShop.lat},${selectedShop.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                                    >
                                        🗺 Navigate
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && shops.length === 0 && (
                    <div className="absolute top-24 left-1/2 z-10 -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 text-center shadow-lg backdrop-blur sm:bottom-6 sm:top-auto sm:px-6 sm:py-4">
                        <p className="text-xs sm:text-sm font-medium text-stone-600">
                            No burger shops found in this area. Try a different search or zoom out.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
