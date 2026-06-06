import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface Burger {
    id: number;
    name: string;
    description: string | null;
    price: string;
    image: string | null;
}

interface Comment {
    id: number;
    message: string;
    rating: number | null;
    created_at: string;
    user: { name: string; avatar: string | null };
}

interface Shop {
    id: number;
    name: string;
    description: string | null;
    address: string;
    lat: number;
    lng: number;
    opening_hours: Record<string, { open: string; close: string }> | null;
    phone: string | null;
    image: string | null;
    status_label: string;
    average_rating: number;
}

interface Props {
    shop: Shop;
    burgers: Burger[];
    comments: Comment[];
}

const dayNames: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
};

function getStatusColor(status: string) {
    if (status === 'open') return 'text-green-600 bg-green-50';
    if (status === 'closing_soon') return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
}

function getStatusDot(status: string) {
    if (status === 'open') return 'bg-green-500';
    if (status === 'closing_soon') return 'bg-amber-500';
    return 'bg-red-500';
}

export default function ShopShow({ shop, burgers, comments }: Props) {
    const { auth } = usePage().props;
    const user = auth.user as any;
    const [rating, setRating] = useState(0);

    const commentForm = useForm({
        message: '',
        rating: 0,
    });

    const submitComment = () => {
        commentForm.post(`/shops/${shop.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
                setRating(0);
            },
        });
    };

    return (
        <>
            <Head title={`${shop.name} - Cariburger`} />

            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                {/* Hero */}
                <div className="relative h-64 bg-stone-800">
                    {shop.image ? (
                        <img
                            src={`/storage/${shop.image}`}
                            alt={shop.name}
                            className="h-full w-full object-cover opacity-70"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-6xl">🍔</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="mx-auto max-w-3xl">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(shop.status_label)}`}>
                                    <span className={`h-2 w-2 rounded-full ${getStatusDot(shop.status_label)}`} />
                                    {shop.status_label === 'open' ? 'Open Now' : shop.status_label === 'closing_soon' ? 'Closing Soon' : 'Closed'}
                                </span>
                                {shop.average_rating > 0 && (
                                    <span className="text-sm text-white/80">
                                        {shop.average_rating.toFixed(1)} ★ ({comments.length} reviews)
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-2 text-3xl font-bold text-white">{shop.name}</h1>
                            <p className="mt-1 text-white/70">{shop.address}</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 py-8">
                    {/* Back link */}
                    <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        ← Back to map
                    </Link>

                    {/* About */}
                    {shop.description && (
                        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                            <h2 className="mb-3 text-lg font-semibold">About</h2>
                            <p className="text-muted-foreground leading-relaxed">{shop.description}</p>
                        </section>
                    )}

                    {/* Menu */}
                    <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                            🍔 Menu
                            <span className="text-sm font-normal text-muted-foreground">({burgers.length} items)</span>
                        </h2>
                        {burgers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No menu items yet.</p>
                        ) : (
                            <div className="grid gap-3">
                                {burgers.map((burger) => (
                                    <div
                                        key={burger.id}
                                        className="flex items-start gap-4 rounded-xl border bg-stone-50 p-4 hover:bg-amber-50/50 transition-colors"
                                    >
                                        {burger.image ? (
                                            <img
                                                src={`/storage/${burger.image}`}
                                                alt={burger.name}
                                                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                                <span className="text-3xl">🍔</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold">{burger.name}</h3>
                                                <span className="shrink-0 text-lg font-bold text-primary">
                                                    RM {parseFloat(burger.price).toFixed(2)}
                                                </span>
                                            </div>
                                            {burger.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">{burger.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Opening Hours */}
                    {shop.opening_hours && (
                        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                            <h2 className="mb-3 text-lg font-semibold">Opening Hours</h2>
                            <div className="grid gap-1.5">
                                {Object.entries(dayNames).map(([key, label]) => {
                                    const hours = shop.opening_hours?.[key];
                                    const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
                                    const isToday = key === today;
                                    return (
                                        <div
                                            key={key}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                                isToday ? 'bg-primary/10 font-medium' : ''
                                            }`}
                                        >
                                            <span>{label}</span>
                                            <span className="text-muted-foreground">
                                                {hours ? `${hours.open} – ${hours.close}` : 'Closed'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Mini Map */}
                    <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                        <h2 className="mb-3 text-lg font-semibold">Location</h2>
                        <div className="h-48 overflow-hidden rounded-xl">
                            <MapContainer
                                center={[shop.lat, shop.lng]}
                                zoom={16}
                                className="h-full w-full"
                                zoomControl={false}
                                scrollWheelZoom={false}
                                dragging={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[shop.lat, shop.lng]} />
                            </MapContainer>
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            🗺 Open in Google Maps →
                        </a>
                    </section>

                    {/* Comments */}
                    <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                        <h2 className="mb-4 text-lg font-semibold">
                            Reviews ({comments.length})
                        </h2>

                        {/* Comment form */}
                        {user ? (
                            <div className="mb-6 rounded-xl border bg-stone-50 p-4">
                                <div className="mb-2 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-xl ${star <= rating ? 'text-amber-500' : 'text-stone-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="Share your experience..."
                                    value={commentForm.data.message}
                                    onChange={(e) => commentForm.setData('message', e.target.value)}
                                    className="mb-3 min-h-[80px]"
                                />
                                <InputError message={commentForm.errors.message} />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={submitComment}
                                        disabled={commentForm.processing || !commentForm.data.message.trim()}
                                        className="gap-2"
                                    >
                                        {commentForm.processing ? 'Posting...' : 'Post Review'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 rounded-xl border bg-stone-50 p-6 text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Sign in to leave a review
                                </p>
                                <a
                                    href="/auth/google/redirect"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                        <path fill="#fff" opacity="0.7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#fff" opacity="0.5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#fff" opacity="0.3" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Sign in with Google
                                </a>
                            </div>
                        )}

                        {/* Comments list */}
                        <div className="grid gap-3">
                            {comments.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    No reviews yet. Be the first!
                                </p>
                            )}
                            {comments.map((comment) => (
                                <div key={comment.id} className="rounded-xl border p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                            {comment.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{comment.user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {comment.rating && (
                                            <div className="ml-auto text-amber-500 text-sm">
                                                {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm">{comment.message}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
