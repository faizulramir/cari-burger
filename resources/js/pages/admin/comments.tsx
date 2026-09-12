import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Comment {
    id: number;
    message: string;
    rating: number | null;
    created_at: string;
    user: { name: string; email: string } | null;
    shop: { name: string } | null;
}

interface Props {
    comments: {
        data: Comment[];
        links: { url: string | null; label: string; active: boolean }[];
        last_page: number;
    };
}

export default function AdminComments({ comments }: Props) {
    return (
        <>
            <Head title="Moderate Reviews - Admin" />
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <h1 className="text-2xl font-bold">Moderate Reviews</h1>
                    <p className="mb-6 text-sm text-muted-foreground">Delete spam or abusive reviews.</p>
                    <div className="grid gap-3">
                        {comments.data.map((c) => (
                            <div key={c.id} className="rounded-2xl border bg-white p-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{c.user?.name}</span>
                                    <span className="text-muted-foreground">on {c.shop?.name}</span>
                                    {c.rating && <span className="ml-auto text-amber-500">{'★'.repeat(c.rating)}</span>}
                                </div>
                                <p className="mt-2 text-sm">{c.message}</p>
                                <div className="mt-2 flex justify-end">
                                    <Link href={`/admin/comments/${c.id}`} method="delete" as="button">
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200">Delete</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {comments.data.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No reviews.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
