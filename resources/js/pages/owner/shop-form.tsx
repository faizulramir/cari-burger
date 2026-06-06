import { Head, useForm, usePage } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

interface Burger {
    id: number;
    name: string;
    description: string | null;
    price: string;
    image: string | null;
}

interface Props {
    shop?: {
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
    } | null;
    burgers?: Burger[];
}

function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return <Marker position={[lat, lng]} draggable eventHandlers={{
        dragend: (e) => {
            const pos = e.target.getLatLng();
            onChange(pos.lat, pos.lng);
        },
    }} />;
}

export default function OwnerShopForm({ shop, burgers = [] }: Props) {
    const isEdit = !!shop;
    const { props: pageProps } = usePage();
    const flash = (pageProps as any).flash || {};

    const form = useForm({
        name: shop?.name || '',
        description: shop?.description || '',
        address: shop?.address || '',
        lat: shop?.lat || 3.139,
        lng: shop?.lng || 101.6869,
        phone: shop?.phone || '',
        opening_hours: shop?.opening_hours || ({} as Record<string, { open: string; close: string }>),
        image: null as File | null,
    });

    const [burgerForm, setBurgerForm] = useState({
        name: '',
        description: '',
        price: '',
        image: null as File | null,
    });

    const [editingBurger, setEditingBurger] = useState<Burger | null>(null);

    const updateHours = (day: string, field: 'open' | 'close', value: string) => {
        form.setData('opening_hours', {
            ...form.data.opening_hours,
            [day]: {
                ...(form.data.opening_hours[day] || { open: '', close: '' }),
                [field]: value,
            },
        });
    };

    const toggleDay = (day: string) => {
        const current = form.data.opening_hours;
        if (current[day]) {
            const next = { ...current };
            delete next[day];
            form.setData('opening_hours', next);
        } else {
            form.setData('opening_hours', {
                ...current,
                [day]: { open: '09:00', close: '22:00' },
            });
        }
    };

    const submitShop = () => {
        if (isEdit) {
            form.patch('/owner/shop', {
                onSuccess: () => {},
            });
        } else {
            form.post('/owner/shop', {
                onSuccess: () => {},
            });
        }
    };

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            approved: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[status] || colors.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Shop' : 'Create Shop'} />

            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="mx-auto max-w-3xl px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">
                            {isEdit ? 'Manage Your Shop' : 'Create Your Shop'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isEdit
                                ? 'Update your shop details and manage your burger menu.'
                                : 'Get your burger shop on the map. We\'ll review it before it goes live.'}
                        </p>
                        {isEdit && shop && (
                            <div className="mt-2">{statusBadge(shop.status)}</div>
                        )}
                    </div>

                    {/* Flash message */}
                    {(flash.success || flash.error) && (
                        <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${
                            flash.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {flash.success || flash.error}
                        </div>
                    )}

                    {/* Shop Info Form */}
                    <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                        <h2 className="mb-4 text-lg font-semibold">Shop Information</h2>

                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="name">Shop Name *</Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1" placeholder="e.g. Burger King KL" />
                                <InputError message={form.errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm resize-none h-24"
                                    placeholder="Tell customers about your shop..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="address">Address *</Label>
                                <Input id="address" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} className="mt-1" placeholder="Street address" />
                                <InputError message={form.errors.address} />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className="mt-1" placeholder="+60 12-345 6789" />
                            </div>

                            <div>
                                <Label>Shop Image</Label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('image', e.target.files?.[0] || null)}
                                    className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                                />
                                {shop?.image && (
                                    <img src={`/storage/${shop.image}`} alt="Current" className="mt-2 h-24 w-24 rounded-lg object-cover" />
                                )}
                            </div>

                            {/* Location picker */}
                            <div>
                                <Label>Pin Your Location on Map *</Label>
                                <p className="text-xs text-muted-foreground mb-2">Click or drag the marker to set your shop location.</p>
                                <div className="h-64 overflow-hidden rounded-xl border">
                                    <MapContainer center={[form.data.lat, form.data.lng]} zoom={15} className="h-full w-full" zoomControl={false}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationPicker
                                            lat={form.data.lat}
                                            lng={form.data.lng}
                                            onChange={(lat, lng) => {
                                                form.setData('lat', lat);
                                                form.setData('lng', lng);
                                            }}
                                        />
                                    </MapContainer>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Lat: {form.data.lat.toFixed(6)}, Lng: {form.data.lng.toFixed(6)}
                                </p>
                                <InputError message={form.errors.lat || form.errors.lng} />
                            </div>

                            <Button onClick={submitShop} disabled={form.processing} className="w-full gap-2">
                                {form.processing ? <Spinner className="h-4 w-4" /> : null}
                                {isEdit ? 'Save Changes' : 'Create Shop'}
                            </Button>
                        </div>
                    </section>

                    {/* Opening Hours */}
                    <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                        <h2 className="mb-4 text-lg font-semibold">Opening Hours</h2>
                        <div className="grid gap-3">
                            {Object.entries(dayLabels).map(([day, label]) => {
                                const hours = form.data.opening_hours[day];
                                const isOpen = !!hours;
                                return (
                                    <div key={day} className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`w-24 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                                isOpen ? 'border-primary bg-primary/10 text-primary' : 'border-stone-200 text-muted-foreground'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                        {isOpen ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={hours.open}
                                                    onChange={(e) => updateHours(day, 'open', e.target.value)}
                                                    className="w-32 text-sm"
                                                />
                                                <span className="text-sm text-muted-foreground">to</span>
                                                <Input
                                                    type="time"
                                                    value={hours.close}
                                                    onChange={(e) => updateHours(day, 'close', e.target.value)}
                                                    className="w-32 text-sm"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Closed</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Burger Menu Management (edit mode only) */}
                    {isEdit && (
                        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border">
                            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                                🍔 Menu ({burgers.length} items)
                            </h2>

                            {/* Existing burgers */}
                            {burgers.length > 0 && (
                                <div className="mb-6 grid gap-2">
                                    {burgers.map((burger) => (
                                        <div key={burger.id} className="flex items-center gap-3 rounded-xl border p-3">
                                            {burger.image ? (
                                                <img src={`/storage/${burger.image}`} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                            ) : (
                                                <span className="text-2xl">🍔</span>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{burger.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    RM {parseFloat(burger.price).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingBurger(burger);
                                                        setBurgerForm({
                                                            name: burger.name,
                                                            description: burger.description || '',
                                                            price: String(parseFloat(burger.price)),
                                                            image: null,
                                                        });
                                                    }}
                                                    className="rounded-lg border px-3 py-1.5 text-xs hover:bg-stone-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Remove this burger?')) {
                                                            const form = useForm({});
                                                            form.delete(`/owner/burgers/${burger.id}`);
                                                        }
                                                    }}
                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add/Edit Burger Form */}
                            <div className="rounded-xl border bg-stone-50 p-4">
                                <h3 className="mb-3 text-sm font-semibold">
                                    {editingBurger ? 'Edit Burger' : 'Add New Burger'}
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Label>Name *</Label>
                                        <Input
                                            value={burgerForm.name}
                                            onChange={(e) => setBurgerForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="e.g. Double Cheeseburger"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Price (RM) *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={burgerForm.price}
                                            onChange={(e) => setBurgerForm(f => ({ ...f, price: e.target.value }))}
                                            placeholder="15.90"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Image</Label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setBurgerForm(f => ({ ...f, image: e.target.files?.[0] || null }))}
                                            className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-xs file:font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={burgerForm.description}
                                            onChange={(e) => setBurgerForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="Brief description..."
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex gap-2">
                                        {editingBurger ? (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        const burgerFormWithFile = new FormData();
                                                        burgerFormWithFile.append('name', burgerForm.name);
                                                        burgerFormWithFile.append('description', burgerForm.description);
                                                        burgerFormWithFile.append('price', burgerForm.price);
                                                        if (burgerForm.image) burgerFormWithFile.append('image', burgerForm.image);
                                                        burgerFormWithFile.append('_method', 'PATCH');
                                                        // We'll submit via a regular form for file uploads
                                                        const xhr = new XMLHttpRequest();
                                                        xhr.open('POST', `/owner/burgers/${editingBurger.id}`);
                                                        xhr.setRequestHeader('X-CSRF-TOKEN', (document.querySelector('meta[name="csrf-token"]') as any)?.content || '');
                                                        xhr.onload = () => { if (xhr.status === 200) window.location.reload(); };
                                                        xhr.send(burgerFormWithFile);
                                                    }}
                                                    className="flex-1 gap-2"
                                                >
                                                    Update Burger
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingBurger(null);
                                                        setBurgerForm({ name: '', description: '', price: '', image: null });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    const burgerData = new FormData();
                                                    burgerData.append('name', burgerForm.name);
                                                    burgerData.append('description', burgerForm.description);
                                                    burgerData.append('price', burgerForm.price);
                                                    if (burgerForm.image) burgerData.append('image', burgerForm.image);
                                                    const xhr = new XMLHttpRequest();
                                                    xhr.open('POST', '/owner/burgers');
                                                    xhr.setRequestHeader('X-CSRF-TOKEN', (document.querySelector('meta[name="csrf-token"]') as any)?.content || '');
                                                    xhr.onload = () => { if (xhr.status === 200) window.location.reload(); };
                                                    xhr.send(burgerData);
                                                }}
                                                className="w-full gap-2"
                                                disabled={!burgerForm.name || !burgerForm.price}
                                            >
                                                Add to Menu
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Info box for new shops */}
                    {!isEdit && (
                        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
                            <p className="text-sm font-medium text-primary">
                After creating your shop, you can add your burger menu and opening hours.
            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                Your shop will be reviewed by our team before appearing on the map.
            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
