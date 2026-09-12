import { Head, Link } from '@inertiajs/react';
import { Store, Beef, Users, MessageSquare, Star, Clock, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

interface Stats {
    total_shops: number;
    pending_shops: number;
    approved_shops: number;
    rejected_shops: number;
    total_burgers: number;
    pending_burgers: number;
    approved_burgers: number;
    total_users: number;
    total_owners: number;
    total_comments: number;
    avg_rating: number;
    open_now: number;
}

interface Props {
    stats: Stats;
    recent_shops: { id: number; name: string; status: string; created_at: string; owner: { name: string } | null }[];
    recent_comments: { id: number; message: string; rating: number | null; created_at: string; user: { name: string }; shop: { name: string } }[];
    top_shops: { id: number; name: string; avg_rating: number; comments_count: number }[];
    shops_by_day: { date: string; count: number }[];
    flash?: { success?: string };
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    href,
    accent,
}: {
    icon: any;
    label: string;
    value: string | number;
    sub?: string;
    href?: string;
    accent: string;
}) {
    const inner = (
        <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 transition-all hover:shadow-md">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-0.5 truncate text-2xl font-bold tracking-tight">{value}</p>
                {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

function ActionCard({
    icon: Icon,
    title,
    desc,
    href,
    badge,
    accent,
}: {
    icon: any;
    title: string;
    desc: string;
    href: string;
    badge?: number;
    accent: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold group-hover:text-primary">{title}</h2>
                    {badge !== undefined && badge > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            {badge} pending
                        </span>
                    )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
    );
}

function statusPill(status: string) {
    const map: Record<string, string> = {
        approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? map.pending}`}>
            {status}
        </span>
    );
}

export default function AdminDashboard({ stats, recent_shops, recent_comments, top_shops, shops_by_day, flash }: Props) {
    const maxDay = Math.max(1, ...shops_by_day.map((d) => d.count));
    const totalPending = stats.pending_shops + stats.pending_burgers;

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {stats.total_shops} shops · {stats.total_burgers} burgers · {stats.total_users} users
                        </p>
                    </div>
                    {totalPending > 0 ? (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                            <AlertCircle className="h-4 w-4" />
                            {totalPending} items awaiting review
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
                            ✓ All caught up
                        </div>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Store} label="Total shops" value={stats.total_shops} sub={`${stats.open_now} open now`} href="/admin/shops" accent="bg-orange-100 text-orange-600" />
                    <StatCard icon={Clock} label="Pending shops" value={stats.pending_shops} sub={`${stats.approved_shops} approved`} href="/admin/shops?status=pending" accent="bg-amber-100 text-amber-600" />
                    <StatCard icon={Beef} label="Pending burgers" value={stats.pending_burgers} sub={`${stats.total_burgers} total`} href="/admin/burgers?status=pending" accent="bg-red-100 text-red-600" />
                    <StatCard icon={Star} label="Avg rating" value={stats.avg_rating || '—'} sub={`${stats.total_comments} reviews`} href="/admin/comments" accent="bg-yellow-100 text-yellow-600" />
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-muted-foreground">QUICK ACTIONS</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ActionCard icon={Store} title="Shop approvals" desc="Review new shop submissions" href="/admin/shops" badge={stats.pending_shops} accent="bg-orange-100 text-orange-600" />
                        <ActionCard icon={Beef} title="Burger approvals" desc="Moderate menu items" href="/admin/burgers" badge={stats.pending_burgers} accent="bg-red-100 text-red-600" />
                        <ActionCard icon={MessageSquare} title="Moderate reviews" desc="Remove spam or abusive content" href="/admin/comments" accent="bg-blue-100 text-blue-600" />
                        <ActionCard icon={Users} title="Users" desc={`${stats.total_users} users · ${stats.total_owners} owners`} href="/admin/users" accent="bg-violet-100 text-violet-600" />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" /> New shops · 14 days
                            </h3>
                        </div>
                        <div className="flex h-28 items-end gap-1.5">
                            {shops_by_day.map((d) => (
                                <div
                                    key={d.date}
                                    title={`${d.date}: ${d.count}`}
                                    className="flex-1 rounded-md bg-primary/70 transition-all hover:bg-primary"
                                    style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                                />
                            ))}
                            {shops_by_day.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5">
                        <h3 className="mb-3 font-semibold">Top rated shops</h3>
                        <div className="grid gap-1">
                            {top_shops.map((s, i) => (
                                <Link key={s.id} href={`/shops/${s.id}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                                    <span className="w-5 shrink-0 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                                    <span className="shrink-0 text-amber-500">★ {(s.avg_rating || 0).toFixed(1)}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground">({s.comments_count})</span>
                                </Link>
                            ))}
                            {top_shops.length === 0 && <p className="text-sm text-muted-foreground">No ratings yet.</p>}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5">
                        <h3 className="mb-3 font-semibold">Recent shops</h3>
                        <div className="grid gap-1">
                            {recent_shops.map((s) => (
                                <div key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                                    <span className="min-w-0 flex-1 truncate">
                                        {s.name} <span className="text-muted-foreground">· {s.owner?.name}</span>
                                    </span>
                                    {statusPill(s.status)}
                                </div>
                            ))}
                            {recent_shops.length === 0 && <p className="text-sm text-muted-foreground">No shops yet.</p>}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5">
                        <h3 className="mb-3 font-semibold">Recent reviews</h3>
                        <div className="grid gap-2">
                            {recent_comments.map((c) => (
                                <div key={c.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                                    <p className="truncate">
                                        <span className="font-medium">{c.user?.name}</span>
                                        <span className="text-muted-foreground"> on {c.shop?.name}</span>
                                        {c.rating ? <span className="ml-2 text-amber-500">{'★'.repeat(c.rating)}</span> : null}
                                    </p>
                                    <p className="mt-0.5 line-clamp-1 text-muted-foreground">{c.message}</p>
                                </div>
                            ))}
                            {recent_comments.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin Dashboard', href: '/admin' }],
};
