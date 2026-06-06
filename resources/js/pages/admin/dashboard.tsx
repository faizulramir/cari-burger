import { Head, Link } from '@inertiajs/react';

interface Props {
    flash?: { success?: string };
}

export default function AdminDashboard({ flash }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">🛠 Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage shops, users, and content.</p>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/admin/shops"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">🏪</span>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary">Shop Approvals</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Review and approve/reject shop submissions.</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">👥</span>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary">User Management</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Manage user roles and permissions.</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="group rounded-2xl bg-white p-6 shadow-sm border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">🗺</span>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary">View Map</h2>
                                <p className="mt-1 text-sm text-muted-foreground">See the public map with all approved shops.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
