import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Props {
    flash?: { success?: string; error?: string };
}

export default function OwnerDashboard({ flash }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">👋 Welcome, Shop Owner!</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your burger shop from here.</p>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4">
                    <Link
                        href="/owner/shop/create"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                                🏪
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    Set Up Your Shop
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your shop profile, add burgers to the menu, set opening hours, and pin your location on the map.
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/owner/shop/edit"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                ✏️
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    Edit Shop & Menu
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update your shop details, manage your burger menu, change opening hours.
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl">
                                🗺
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    View Map
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    See how your shop appears on the public map. Only approved shops are visible.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
