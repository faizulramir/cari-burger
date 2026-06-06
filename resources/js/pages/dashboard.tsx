import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user as any;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                <div>
                    <h2 className="text-xl font-bold">Welcome back, {user?.name}!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Discover burger shops near you.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Map */}
                    <Link
                        href="/"
                        className="group rounded-2xl border p-6 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <span className="text-3xl">🗺</span>
                        <h3 className="mt-3 text-lg font-semibold group-hover:text-primary">Explore Map</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Find burger shops near you on the interactive map.</p>
                    </Link>

                    {/* Browse shops */}
                    <Link
                        href="/shops"
                        className="group rounded-2xl border p-6 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <span className="text-3xl">🍔</span>
                        <h3 className="mt-3 text-lg font-semibold group-hover:text-primary">Browse Shops</h3>
                        <p className="mt-1 text-sm text-muted-foreground">View all approved burger shops with ratings.</p>
                    </Link>

                    {/* Recent activity placeholder */}
                    <div className="rounded-2xl border p-6">
                        <span className="text-3xl">❤️</span>
                        <h3 className="mt-3 text-lg font-semibold">My Favorites</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Coming soon. Save your favorite burger spots!</p>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
