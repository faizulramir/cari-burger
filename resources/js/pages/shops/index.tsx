import { Head, Link } from '@inertiajs/react';

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
    filters: { search?: string };
}

export default function ShopsIndex({ shops, filters }: Props) {
    return (
        <>
            <Head title="Browse Burger Shops" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            🍔 Burger Shops
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Discover {shops.data.length} burger shops near you.
                        </p>
                        <Link href="/" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            ← View on map
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {shops.data.map((shop) => (
                            <Link
                                key={shop.id}
                                href={`/shops/${shop.id}`}
                                className="group overflow-hidden rounded-2xl bg-white shadow-sm border hover:shadow-md hover:border-primary/30 transition-all"
                            >
                                <div className="relative h-44 bg-stone-200 overflow-hidden">
                                    {shop.image ? (
                                        <img
                                            src={`/storage/${shop.image}`}
                                            alt={shop.name}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        {shop.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
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
                            </Link>
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
        </>
    );
}
