import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'user';
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { role?: string; search?: string };
    flash?: { success?: string };
}

export default function AdminUsers({ users, filters }: Props) {
    const updateRole = (userId: number, role: string) => {
        router.patch(`/admin/users/${userId}/role`, { role }, {
            preserveScroll: true,
        });
    };

    const roleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            owner: 'bg-blue-100 text-blue-700',
            user: 'bg-stone-100 text-stone-700',
        };
        return <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[role]}`}>{role}</span>;
    };

    return (
        <>
            <Head title="Manage Users - Admin" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage user roles and permissions.</p>
                    </div>

                    {/* Search + Filter */}
                    <div className="mb-4 flex gap-3">
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                placeholder="Search users..."
                                defaultValue={filters.search}
                                name="search"
                                className="w-64"
                            />
                            <Button type="submit" variant="outline" size="sm">Search</Button>
                        </form>
                        <div className="flex gap-2">
                            {['', 'admin', 'owner', 'user'].map((r) => (
                                <a
                                    key={r}
                                    href={`/admin/users${r ? `?role=${r}` : ''}`}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        filters.role === r || (!filters.role && r === '')
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-white border hover:bg-stone-50'
                                    }`}
                                >
                                    {r || 'All'}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-2xl bg-white shadow-sm border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">Name</th>
                                    <th className="px-6 py-3 text-left font-medium">Email</th>
                                    <th className="px-6 py-3 text-left font-medium">Role</th>
                                    <th className="px-6 py-3 text-left font-medium">Joined</th>
                                    <th className="px-6 py-3 text-right font-medium">Change Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                        <td className="px-6 py-4">{roleBadge(user.role)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                defaultValue={user.role}
                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                className="rounded-lg border px-3 py-1.5 text-xs"
                                            >
                                                <option value="user">User</option>
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {users.links.filter(l => l.url).map((link, i) => (
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
