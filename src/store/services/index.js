import { authApi } from './auth.api';
import { locationApi } from './location.api';
import { orderApi } from './Order.api';
import { stockApi } from './stock.api';
import { userApi } from './user.api';
export const apis = [
    authApi,
    stockApi,
    orderApi,
    locationApi,
    userApi
];
