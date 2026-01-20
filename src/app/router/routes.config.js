import { lazy } from 'react';
import { ROLES } from '../permissions/roles';

export const ROUTES = [
    {
        path: '/login',
        component: lazy(() => import('../../Components/Common/Login')),
        roles: null, 
    },
];

