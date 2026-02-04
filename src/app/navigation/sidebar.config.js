// navigation/sidebar.config.js
import { ROLES } from '../permissions/roles';
import { Users, Package, LayoutDashboard, BringToFront } from 'lucide-react';



export const SIDEBAR_CONFIG = [
    {
        label: 'sidebar.item2',
        path: '/orders',
        icon: BringToFront,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
    },
    {
        label: 'sidebar.item1',
        path: '/order-create',
        icon: Package,
        roles: [ROLES.ADMIN],
    },

];

