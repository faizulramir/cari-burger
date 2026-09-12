import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

interface Burger {
    id: number;
    name: string;
    description: string | null;
    price: string;
    image: string | null;
}

interface CommentItem {
    id: number;
    message: string;
    rating: number | null;
    created_at: string;
    user: { name: string; avatar: string | null };
}

interface ShopDetail {
    id: number;
    name: string;
    description: string | null;
    address: string;
    lat: number;
    lng: number;
    opening_hours: Record<string, { open: string; close: string }> | null;
    phone: string | null;
    image: string | null;
    status: string;
    status_label: string;
    average_rating: number;
    favorites_count: number;
    is_favorited: boolean;
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

function statusText(status: string) {
    if (status === 'open') return 'Open Now';
    if (status === 'closing_soon') return 'Closing Soon';
    return 'Closed';
}

export function AuthPrompt({ onClose, action = 'continue' }: { onClose: () => void; action?: string }) {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
                    🍔
                </div>
                <h3 className="mt-4 text-lg font-bold text-stone-800">Sign in to {action}</h3>
                <p className="mt-1 text-sm text-stone-500">
                    Create an account or sign in to save favorites and leave reviews.
                </p>
                <div className="mt-5 grid gap-2">
                    <a
                        href="/login"
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                        Sign In
                    </a>
                    <a
                        href="/login"
                        className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                        Create Account
                    </a>
                    <button onClick={onClose} className="mt-1 text-xs text-stone-400 hover:underline">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ShopDetailModal({ shopId, onClose }: { shopId: number | null; onClose: () => void }) {
    const { auth } = usePage().props;
    const user = (auth as any)?.user as any;
    const [detail, setDetail] = useState<{ shop: ShopDetail; burgers: Burger[]; comments: CommentItem[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAuth, setShowAuth] = useState(false);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!shopId) {
            setDetail(null);
            setError('');
            setMessage('');
            setRating(0);
            setShowAuth(false);
            return;
        }
        setLoading(true);
        setError('');
        fetch(`/api/shops/${shopId}`, { headers: { Accept: 'application/json' } })
            .then((r) => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then((data) => setDetail(data))
            .catch(() => setError('Could not load shop details.'))
            .finally(() => setLoading(false));
    }, [shopId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!shopId) return null;

    const refetch = () => {
        fetch(`/api/shops/${shopId}`, { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((data) => setDetail(data))
            .catch(() => {});
    };

    const toggleFavorite = () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        router.post(
            `/shops/${shopId}/favorite`,
            {},
            { preserveScroll: true, preserveState: true, onSuccess: () => refetch() },
        );
    };

    const submitComment = () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        if (!message.trim()) return;
        setSubmitting(true);
        router.post(
            `/shops/${shopId}/comments`,
            { message, rating: rating || undefined },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setMessage('');
                    setRating(0);
                    refetch();
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const shop = detail?.shop;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
            <div
                className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl leading-none text-white hover:bg-black/60"
                >
                    &times;
                </button>

                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <Spinner className="h-8 w-8 text-primary" />
                    </div>
                )}

                {!loading && error && (
                    <div className="px-6 py-24 text-center">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button className="mt-4" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                )}

                {!loading && shop && detail && (
                    <>
                        <div className="relative h-56 bg-stone-800 sm:h-64">
                            {shop.image ? (
                                <img src={`/storage/${shop.image}`} alt={shop.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <span className="text-6xl">🍔</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white ${
                                        shop.status_label === 'open' ? 'bg-green-600' : shop.status_label === 'closing_soon' ? 'bg-amber-600' : 'bg-red-600'
                                    }`}
                                >
                                    {statusText(shop.status_label)}
                                </span>
                                <h2 className="mt-2 text-2xl font-bold text-white">{shop.name}</h2>
                                <p className="mt-0.5 text-sm text-white/75">{shop.address}</p>
                                {shop.average_rating > 0 && (
                                    <p className="mt-1 text-sm text-amber-300">
                                        ★ {shop.average_rating.toFixed(1)} · {detail.comments.length} reviews
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="flex gap-2">
                                <Button onClick={toggleFavorite} variant={shop.is_favorited ? 'default' : 'outline'} className="flex-1">
                                    {shop.is_favorited ? `♥ Saved (${shop.favorites_count})` : `♡ Save Favorite (${shop.favorites_count})`}
                                </Button>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                                >
                                    🗺 Navigate
                                </a>
                            </div>

                            {shop.description && (
                                <section className="rounded-2xl border bg-stone-50/60 p-4">
                                    <h3 className="mb-1 text-sm font-semibold">About</h3>
                                    <p className="text-sm leading-relaxed text-stone-600">{shop.description}</p>
                                    {shop.phone && <p className="mt-2 text-sm text-stone-500">📞 {shop.phone}</p>}
                                </section>
                            )}

                            <section>
                                <h3 className="mb-3 text-base font-semibold">🍔 Menu ({detail.burgers.length})</h3>
                                {detail.burgers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No menu items yet.</p>
                                ) : (
                                    <div className="grid gap-2">
                                        {detail.burgers.map((b) => (
                                            <div key={b.id} className="flex items-start gap-3 rounded-xl border p-3">
                                                {b.image ? (
                                                    <img src={`/storage/${b.image}`} alt={b.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-2xl">
                                                        🍔
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold">{b.name}</p>
                                                        <p className="shrink-0 text-sm font-bold text-primary">RM {Number.parseFloat(b.price).toFixed(2)}</p>
                                                    </div>
                                                    {b.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {shop.opening_hours && (
                                <section>
                                    <h3 className="mb-2 text-base font-semibold">Opening Hours</h3>
                                    <div className="grid gap-1">
                                        {Object.entries(dayNames).map(([key, label]) => {
                                            const hours = shop.opening_hours?.[key];
                                            const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
                                            return (
                                                <div
                                                    key={key}
                                                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${key === today ? 'bg-primary/10 font-medium' : ''}`}
                                                >
                                                    <span>{label}</span>
                                                    <span className="text-muted-foreground">{hours ? `${hours.open} – ${hours.close}` : 'Closed'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h3 className="mb-3 text-base font-semibold">Reviews ({detail.comments.length})</h3>
                                {user ? (
                                    <div className="mb-4 rounded-xl border bg-stone-50 p-3">
                                        <div className="mb-2 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setRating(s)}
                                                    className={`text-lg ${s <= rating ? 'text-amber-500' : 'text-stone-300'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                            {rating > 0 && (
                                                <button type="button" onClick={() => setRating(0)} className="ml-2 text-xs text-muted-foreground hover:underline">
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Share your experience..."
                                            className="mb-2 min-h-[70px]"
                                        />
                                        <div className="flex justify-end">
                                            <Button size="sm" onClick={submitComment} disabled={submitting || !message.trim()}>
                                                {submitting ? 'Posting...' : 'Post Review'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAuth(true)}
                                        className="mb-4 w-full rounded-xl border bg-stone-50 p-4 text-center text-sm text-muted-foreground hover:bg-stone-100"
                                    >
                                        Sign in to leave a review
                                    </button>
                                )}
                                <div className="grid gap-2">
                                    {detail.comments.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                                    )}
                                    {detail.comments.map((c) => (
                                        <div key={c.id} className="rounded-xl border p-3">
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                    {c.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-xs font-medium">{c.user.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                                                {c.rating ? <span className="ml-auto text-xs text-amber-500">{'★'.repeat(c.rating)}</span> : null}
                                            </div>
                                            <p className="text-sm">{c.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <Link href={`/shops/${shop.id}`} className="block text-center text-xs text-muted-foreground hover:underline">
                                Open full page →
                            </Link>
                        </div>
                    </>
                )}

                {showAuth && <AuthPrompt onClose={() => setShowAuth(false)} action="save favorites" />}
            </div>
        </div>
    );
}
