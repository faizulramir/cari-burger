import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Shop {
    id: number;
    name: string;
    address: string;
    status: string;
    created_at: string;
    owner: { id: number; name: string; email: string } | null;
}

interface Props {
    shops: {
        data: Shop[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string };
    counts: { pending: number; approved: number; rejected: number };
    flash?: { success?: string };
}

export default function AdminShops({ shops, filters, counts }: Props) {
    const approveForm = useForm({});
    const rejectForm = useForm({});

    const approve = (id: number) => {
        approveForm.patch(`/admin/shops/${id}/approve`);
    };

    const reject = (id: number) => {
        rejectForm.patch(`/admin/shops/${id}/reject`);
    };

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            approved: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}>{status}</span>;
    };

    return (
        <>
            <Head title="Manage Shops - Admin" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Shop Management</h1>
                            <p className="text-sm text-muted-foreground">Approve or reject shop submissions.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="rounded-lg bg-white border px-4 py-2 text-center">
                                <p className="text-xs text-muted-foreground">Pending</p>
                                <p className="text-xl font-bold text-amber-600">{counts.pending}</p>
                            </div>
                            <div className="rounded-lg bg-white border px-4 py-2 text-center">
                                <p className="text-xs text-muted-foreground">Approved</p>
                                <p className="text-xl font-bold text-green-600">{counts.approved}</p>
                            </div>
                            <div className="rounded-lg bg-white border px-4 py-2 text-center">
                                <p className="text-xs text-muted-foreground">Rejected</p>
                                <p className="text-xl font-bold text-red-600">{counts.rejected}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 flex gap-2">
                        {['', 'pending', 'approved', 'rejected'].map((s) => (
                            <a
                                key={s}
                                href={`/admin/shops${s ? `?status=${s}` : ''}`}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    filters.status === s || (!filters.status && s === '')
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-white border hover:bg-stone-50'
                                }`}
                            >
                                {s || 'All'}
                            </a>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="rounded-2xl bg-white shadow-sm border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Shop</th>
                                    <th className="px-6 py-3 text-left font-medium">Owner</th>
                                    <th className="px-6 py-3 text-left font-medium">Address</th>
                                    <th className="px-6 py-3 text-left font-medium">Status</th>
                                    <th className="px-6 py-3 text-left font-medium">Date</th>
                                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {shops.data.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-stone-50">
                                        <td className="px-6 py-4 font-medium">{shop.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{shop.owner?.name || '-'}</td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">{shop.address}</td>
                                        <td className="px-6 py-4">{statusBadge(shop.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(shop.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {shop.status === 'pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => approve(shop.id)} disabled={approveForm.processing}>
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => reject(shop.id)} disabled={rejectForm.processing}>
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {shop.status !== 'pending' && (
                                                <span className="text-xs text-muted-foreground">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {shops.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            No shops found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {shops.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
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
