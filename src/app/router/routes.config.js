import { lazy } from 'react';
import { ROLES } from '../permissions/roles';

export const ROUTES = [
    {
        path: '/403',
        component: lazy(() => import('../../Components/Common/403')),
        roles: null,
    },
    {
        path: '/dashboard',
        component: lazy(() => import('../../Components/Common/Dashboard')),
        roles: [ROLES.ADMIN],
    },
    {
        path: '/order-create',
        component: lazy(() => import('../../Components/Common/Order-Create')),
        roles: [ROLES.ADMIN],
    },
    {
        path: '/orders',
        component: lazy(() => import('../../Components/Common/Orders')),
        roles: [ROLES.ADMIN],
    },
    {
        path: '/profile',
        component: lazy(() => import('../../Components/Common/Profile')),
        roles: [ROLES.ADMIN],
    },
    {
        path: '/order-detail-/:id',
        component: lazy(() => import('../../Components/Common/Order-Detail')),
        roles: [ROLES.ADMIN],
    },
];

