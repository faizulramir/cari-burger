import { Head, router, usePage } from '@inertiajs/react';

export default function Onboarding() {
    const { auth } = usePage().props;
    const user = auth.user as any;

    const chooseRole = (role: string) => {
        if (role === 'owner') {
            // Go through the shop creation wizard
            window.location.href = '/onboarding/wizard';
            return;
        }
        router.post('/onboarding/choose', { role }, {
            onSuccess: () => {
                window.location.href = '/dashboard';
            },
        });
    };

    return (
        <>
            <Head title="Welcome! — Cari Burger" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-4">
                <div className="mb-8 text-center">
                    <img src="/burger-marker.svg" alt="" className="mx-auto h-16 w-16" />
                    <h1 className="mt-4 text-2xl font-bold text-stone-800">Welcome to Cari Burger!</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        How would you like to use Cari Burger?
                    </p>
                </div>

                <div className="grid w-full max-w-md gap-4">
                    <button
                        onClick={() => chooseRole('user')}
                        className="group rounded-2xl border bg-white p-6 text-left shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                                🍔
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    Foodie / Explorer
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Discover burger shops near you, read reviews, and find the best burgers in town.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => chooseRole('owner')}
                        className="group rounded-2xl border bg-white p-6 text-left shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                🏪
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    Burger Shop Owner
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    List your shop on the map, add your burger menu, and get discovered by hungry customers.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground max-w-sm">
                    You can always change this later. Shop owners can still explore the map.
                </p>
            </div>
        </>
    );
}

Onboarding.layout = {
    title: 'Welcome — Cari Burger',
};
