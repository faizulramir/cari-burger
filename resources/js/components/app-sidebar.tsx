import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Store, MapPin, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { User } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user as User | null;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Explore Map',
            href: '/',
            icon: MapPin,
        },
        {
            title: 'Browse Shops',
            href: '/shops',
            icon: Store,
        },
        ...(user?.role === 'admin' ? [
            {
                title: 'Admin Panel',
                href: '/admin',
                icon: Settings,
            },
        ] : []),
        ...(user?.role === 'owner' ? [
            {
                title: 'My Shop',
                href: '/owner',
                icon: Store,
            },
        ] : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Cariburger',
            href: '/',
            icon: FolderGit2,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
