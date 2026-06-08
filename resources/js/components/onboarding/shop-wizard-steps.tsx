import { StepComponentProps, StepComponent, OnboardingStep } from '@onboardjs/react';
import { OnboardingContext } from '@onboardjs/core';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// ── Context type ──
export interface ShopWizardContext extends OnboardingContext {
    currentUser?: any;
}

// ── Step 1: Welcome + Shop Name ──
function WelcomeStep({ onDataChange }: StepComponentProps<any, ShopWizardContext>) {
    const [name, setName] = useState('');

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <img src="/burger-marker.svg" alt="" className="h-16 w-16" />
            <div>
                <h2 className="text-2xl font-bold text-stone-800">Let's set up your shop!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    We'll guide you through creating your burger shop listing. It only takes a couple of minutes.
                </p>
            </div>
            <div className="w-full text-left">
                <Label htmlFor="shopName">What's your shop name?</Label>
                <Input
                    id="shopName"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        onDataChange?.({ name: e.target.value }, e.target.value.length >= 2);
                    }}
                    placeholder="e.g. Burger King KL"
                    className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">You can change this later.</p>
            </div>
        </div>
    );
}

// ── Step 2: Address + Map Pin ──
function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) { onChange(e.latlng.lat, e.latlng.lng); },
    });
    return <Marker position={[lat, lng]} draggable eventHandlers={{
        dragend: (e) => { const pos = e.target.getLatLng(); onChange(pos.lat, pos.lng); },
    }} />;
}

function AddressStep({ onDataChange }: StepComponentProps<any, ShopWizardContext>) {
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState(3.139);
    const [lng, setLng] = useState(101.6869);

    const update = (a: string, la: number, ln: number) => {
        setAddress(a);
        setLat(la);
        setLng(ln);
        onDataChange?.({ address: a, lat: la, lng: ln }, a.length >= 5);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="text-center">
                <h2 className="text-xl font-bold text-stone-800">Where is your shop?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter the address and pin the map location.</p>
            </div>
            <div>
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={address}
                    onChange={(e) => update(e.target.value, lat, lng)}
                    placeholder="Street address, city"
                    className="mt-1"
                />
            </div>
            <div>
                <Label>Pin on Map (click or drag)</Label>
                <div className="mt-1 h-52 overflow-hidden rounded-xl border">
                    <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full" zoomControl={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => update(address, la, ln)} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

// ── Step 3: Phone + Description ──
function DetailsStep({ onDataChange }: StepComponentProps<any, ShopWizardContext>) {
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');

    const update = (p: string, d: string) => {
        setPhone(p);
        setDescription(d);
        onDataChange?.({ phone: p, description: d }, true);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="text-center">
                <h2 className="text-xl font-bold text-stone-800">Tell us about your shop</h2>
                <p className="mt-1 text-sm text-muted-foreground">These details help customers find and recognize you.</p>
            </div>
            <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => update(e.target.value, description)}
                    placeholder="+60 12-345 6789"
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="desc">Description</Label>
                <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => update(phone, e.target.value)}
                    placeholder="Tell customers about your burgers..."
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm resize-none h-24"
                />
            </div>
        </div>
    );
}

// ── Step 4: Opening Hours ──
const dayLabels: Record<string, string> = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
    thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

function HoursStep({ onDataChange }: StepComponentProps<any, ShopWizardContext>) {
    const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>({});

    const toggleDay = (day: string) => {
        const next = { ...hours };
        if (next[day]) {
            delete next[day];
        } else {
            next[day] = { open: '09:00', close: '22:00' };
        }
        setHours(next);
        onDataChange?.({ opening_hours: next }, true);
    };

    const updateTime = (day: string, field: 'open' | 'close', value: string) => {
        const next = { ...hours };
        if (next[day]) {
            next[day] = { ...next[day]!, [field]: value };
        }
        setHours(next);
        onDataChange?.({ opening_hours: next }, true);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="text-center">
                <h2 className="text-xl font-bold text-stone-800">Opening Hours</h2>
                <p className="mt-1 text-sm text-muted-foreground">Click a day to set hours. Leave unchecked if closed.</p>
            </div>
            <div className="grid gap-2">
                {Object.entries(dayLabels).map(([day, label]) => {
                    const h = hours[day];
                    return (
                        <div key={day} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`w-24 shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                    h ? 'border-primary bg-primary/10 text-primary' : 'border-stone-200 text-muted-foreground'
                                }`}
                            >
                                {label}
                            </button>
                            {h ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Input type="time" value={h.open} onChange={(e) => updateTime(day, 'open', e.target.value)} className="w-28" />
                                    <span className="text-muted-foreground">to</span>
                                    <Input type="time" value={h.close} onChange={(e) => updateTime(day, 'close', e.target.value)} className="w-28" />
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">Closed</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Step 5: Review ──
function ReviewStep({ context }: StepComponentProps<any, ShopWizardContext>) {
    const fd = context.flowData;
    const name = fd.shop_name as string || '';
    const address = fd.shop_address as string || '';
    const phone = fd.shop_phone as string || '';
    const description = fd.shop_description as string || '';
    const hours = (fd.shop_hours as Record<string, any>) || {};
    const openDays = Object.keys(hours).filter(k => hours[k]);

    return (
        <div className="flex flex-col gap-5">
            <div className="text-center">
                <h2 className="text-xl font-bold text-stone-800">Review your shop</h2>
                <p className="mt-1 text-sm text-muted-foreground">Double-check everything before submitting.</p>
            </div>

            <div className="rounded-xl border bg-stone-50 p-4 space-y-3 text-sm">
                <div>
                    <span className="text-xs text-muted-foreground">Name</span>
                    <p className="font-semibold">{name || '-'}</p>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground">Address</span>
                    <p>{address || '-'}</p>
                </div>
                {phone && (
                    <div>
                        <span className="text-xs text-muted-foreground">Phone</span>
                        <p>{phone}</p>
                    </div>
                )}
                {description && (
                    <div>
                        <span className="text-xs text-muted-foreground">Description</span>
                        <p>{description}</p>
                    </div>
                )}
                <div>
                    <span className="text-xs text-muted-foreground">Hours</span>
                    <p>{openDays.length > 0 ? `${openDays.length} days set` : 'Not set'}</p>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                Once submitted, your shop will be reviewed by our team before appearing on the map.
            </p>
        </div>
    );
}

// ── Exported step definitions ──
export const wizardSteps: OnboardingStep<ShopWizardContext>[] = [
    {
        id: 'shop_name',
        type: 'CUSTOM_COMPONENT',
        component: WelcomeStep as any,
        payload: { componentKey: 'shop_name' },
        meta: { title: 'Shop Name' },
    },
    {
        id: 'shop_address',
        type: 'CUSTOM_COMPONENT',
        component: AddressStep as any,
        payload: { componentKey: 'shop_address' },
        meta: { title: 'Location' },
    },
    {
        id: 'shop_details',
        type: 'CUSTOM_COMPONENT',
        component: DetailsStep as any,
        payload: { componentKey: 'shop_details' },
        meta: { title: 'Details' },
    },
    {
        id: 'shop_hours',
        type: 'CUSTOM_COMPONENT',
        component: HoursStep as any,
        payload: { componentKey: 'shop_hours' },
        meta: { title: 'Hours' },
    },
    {
        id: 'shop_review',
        type: 'CUSTOM_COMPONENT',
        component: ReviewStep as any,
        payload: { componentKey: 'shop_review' },
        meta: { title: 'Review' },
        nextStep: null,
    },
];
