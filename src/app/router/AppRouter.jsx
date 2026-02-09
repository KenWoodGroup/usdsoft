import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import MainLayout from '../layout/MainLayout';
import RoleGuard from './RoleGuard';
import { ROUTES } from './routes.config';
import Loading from '../../Components/Other/UI/Loadings/Loading';
import NotFound from '../../Components/Common/404';
import Login from '../../Components/Common/Login';

export default function AppRouter() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>

                {/* редирект с / на /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route element={<MainLayout />}>
                    {ROUTES.map(r => (
                        <Route key={r.path} element={<RoleGuard allow={r.roles} />}>
                            <Route path={r.path} element={<r.component />} />
                        </Route>
                    ))}
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />

            </Routes>
        </Suspense>
    );
}
