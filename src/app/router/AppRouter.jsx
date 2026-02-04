// router/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
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
                <Route element={<MainLayout />}>
                    {ROUTES.map(r => (
                        <Route
                            key={r.path}
                            element={<RoleGuard allow={r.roles} />}
                        >
                            <Route path={r.path} element={<r.component />} />
                        </Route>
                    ))}

                    {/* 🔥 404 — всегда в конце */}
                </Route>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/login" element={<Login />} />
            </Routes>
        </Suspense>
    );
}
