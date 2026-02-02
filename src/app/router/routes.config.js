import { lazy } from 'react';
import { ROLES } from '../permissions/roles';

export const ROUTES = [
    {
        path: '/403',
        component: lazy(() => import('../../Components/Common/403')),
        roles: null,
    },
    {
        path: '/login',
        component: lazy(() => import('../../Components/Common/Login')),
        roles: null,
    },
    {
        path: '/dashboard',
        component: lazy(() => import('../../Components/Common/Dashboard')),
        roles: [ROLES.ADMIN],
    },
];

