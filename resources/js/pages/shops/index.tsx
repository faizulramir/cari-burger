import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ShopDetailModal from '@/components/shop-detail-modal';

interface Shop {
    id: number;
    name: string;
    description: string | null;
    address: string;
    lat: number;
    lng: number;
    image: string | null;
    status_label: string;
    average_rating: number;
    comments_count: number;
    burgers_count: number;
}

interface Props {
    shops: {
        data: Shop[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; open_now?: boolean; max_price?: string; min_rating?: string };
    favorites?: number[];
}

export default function ShopsIndex({ shops, filters, favorites = [] }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [openNow, setOpenNow] = useState(!!filters.open_now);
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [minRating, setMinRating] = useState(filters.min_rating || '');
    const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

    const apply = (overrides: Record<string, unknown> = {}) => {
        router.get('/shops', {
            search: search || undefined,
            open_now: openNow || undefined,
            max_price: maxPrice || undefined,
            min_rating: minRating || undefined,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Browse Burger Shops" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="mb-6">
                        <h1 className="flex items-center gap-2 text-3xl font-bold">
                            🍔 Burger Shops
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Discover {shops.data.length} burger shops near you.
                        </p>
                        <Link href="/" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            ← View on map
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-4 shadow-sm">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && apply()}
                            placeholder="Search shops..."
                            className="h-10 min-w-[160px] flex-1 rounded-xl border px-3 text-sm"
                        />
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                            <input type="checkbox" checked={openNow} onChange={(e) => {
                                setOpenNow(e.target.checked);
                            }} />
                            Open now
                        </label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Max RM"
                            className="h-10 w-28 rounded-xl border px-3 text-sm"
                        />
                        <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="h-10 rounded-xl border px-3 text-sm">
                            <option value="">Any rating</option>
                            <option value="4">4★+</option>
                            <option value="3">3★+</option>
                        </select>
                        <button onClick={() => apply()} className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground">
                            Filter
                        </button>
                        {(filters.search || filters.open_now || filters.max_price || filters.min_rating) && (
                            <button
                                onClick={() => {
                                    setSearch(''); setOpenNow(false); setMaxPrice(''); setMinRating(''); router.get('/shops', {}, { replace: true });
                                }}
                                className="h-10 rounded-xl border px-4 text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {shops.data.map((shop) => (
                            <button
                                key={shop.id}
                                type="button"
                                onClick={() => setSelectedShopId(shop.id)}
                                className="group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                            >
                                <div className="relative h-44 overflow-hidden bg-stone-200">
                                    {shop.image ? (
                                        <img
                                            src={`/storage/${shop.image}`}
                                            alt={shop.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <span className="text-5xl">🍔</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            shop.status_label === 'open'
                                                ? 'bg-green-500 text-white'
                                                : shop.status_label === 'closing_soon'
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-red-500 text-white'
                                        }`}>
                                            {shop.status_label === 'open' ? 'Open' : shop.status_label === 'closing_soon' ? 'Closing Soon' : 'Closed'}
                                        </span>
                                    </div>
                                    {favorites.includes(shop.id) && (
                                        <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs">♥</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                                        {shop.name}
                                    </h3>
                                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                        {shop.address}
                                    </p>
                                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                        {shop.average_rating > 0 && (
                                            <span className="flex items-center gap-1 text-amber-500">
                                                ★ {shop.average_rating.toFixed(1)}
                                                <span className="text-muted-foreground">({shop.comments_count})</span>
                                            </span>
                                        )}
                                        <span>🍔 {shop.burgers_count} items</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {shops.data.length === 0 && (
                        <div className="py-20 text-center">
                            <span className="text-5xl">🍔</span>
                            <h3 className="mt-4 text-lg font-medium">No shops found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {filters.search ? 'Try a different search term.' : 'No approved shops yet. Check back soon!'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {shops.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {shops.links.filter(l => l.url).map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url || '#'}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                        link.active ? 'bg-primary text-primary-foreground' : 'bg-white border hover:bg-stone-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ShopDetailModal shopId={selectedShopId} onClose={() => setSelectedShopId(null)} />
        </>
    );
}
