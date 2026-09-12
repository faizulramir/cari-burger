import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Burger {
    id: number;
    name: string;
    price: string;
    status: string;
    created_at: string;
    shop: { id: number; name: string } | null;
}

interface Props {
    burgers: {
        data: Burger[];
        links: { url: string | null; label: string; active: boolean }[];
        last_page: number;
    };
    filters: { status?: string };
    counts: { pending: number; approved: number; rejected: number };
}

export default function AdminBurgers({ burgers, filters, counts }: Props) {
    const approveForm = useForm({});
    const rejectForm = useForm({});

    return (
        <>
            <Head title="Burger Approvals - Admin" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Burger Approvals</h1>
                            <p className="text-sm text-muted-foreground">Approve menu items before they go live.</p>
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

                    <div className="mb-4 flex gap-2">
                        {['', 'pending', 'approved', 'rejected'].map((s) => (
                            <a
                                key={s}
                                href={`/admin/burgers${s ? `?status=${s}` : ''}`}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${filters.status === s || (!filters.status && s === '') ? 'bg-primary text-primary-foreground' : 'bg-white border hover:bg-stone-50'}`}
                            >
                                {s || 'All'}
                            </a>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Burger</th>
                                    <th className="px-6 py-3 text-left font-medium">Shop</th>
                                    <th className="px-6 py-3 text-left font-medium">Price</th>
                                    <th className="px-6 py-3 text-left font-medium">Status</th>
                                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {burgers.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-stone-50">
                                        <td className="px-6 py-4 font-medium">{b.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{b.shop?.name || '-'}</td>
                                        <td className="px-6 py-4">RM {parseFloat(b.price).toFixed(2)}</td>
                                        <td className="px-6 py-4">{b.status}</td>
                                        <td className="px-6 py-4 text-right">
                                            {b.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => approveForm.patch(`/admin/burgers/${b.id}/approve`)}>Approve</Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => rejectForm.patch(`/admin/burgers/${b.id}/reject`)}>Reject</Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {burgers.data.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No burgers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
