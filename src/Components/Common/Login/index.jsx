import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, User, Lock, Loader2, Eye, EyeOff } from "lucide-react";

import { useLoginMutation } from "../../../store/services/auth.api";
import { useAppDispatch } from "../../../store/hooks";
import { setAuth } from "../../../store/slices/auth.slice";
import { Alert } from "../../Other/UI/Alert/Alert";
import { useTheme } from "../../../app/theme/UseThem";

export default function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isDarkMode, toggleDarkMode } = useTheme();

    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [login, { isLoading }] = useLoginMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            const data = await login({ username, password }).unwrap();
            dispatch(setAuth({
                access_token: data?.tokens?.access_token,
                refresh_token: data?.tokens?.refresh_token,
                role: data?.newUser?.role,
                location_id: data?.newUser?.location_id,
                user_id: data?.newUser?.id,
            }));
            Alert(t("login.loginSuccess"), "success");
            setTimeout(() => navigate("/orders", { replace: true }), 800);
        } catch (err) {
            const message = err?.data?.message || err?.error || t("login.loginError");
            Alert(message, "error");
        }
    };

    const LangButton = ({ code, label }) => {
        const active = i18n.language === code;
        return (
            <button
                type="button"
                onClick={() => i18n.changeLanguage(code)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition
                    ${active
                        ? "bg-mainColor text-white shadow"
                        : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT */}
            <div className="relative hidden lg:block overflow-hidden">
                <div className="login_left_bg absolute inset-0 bg-cover bg-center scale-105" />
                <div className="absolute inset-0 bg-black/10 dark:bg-black/60" />
                <div className="absolute top-6 left-6 z-20 px-4 py-2 text-[35px] rounded-2xl
                    bg-white/20 dark:bg-black/30 backdrop-blur-md text-white shadow-lg">
                    {time.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[80%]">
                    <div className="rounded-3xl px-8 py-6 bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <h1 className="text-white text-3xl font-bold">USD SOFT</h1>
                        <p className="mt-2 text-mainColor text-sm">
                            Secure Admin Panel • Enterprise Access
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border border-gray-300 dark:border-gray-700 bg-card-light dark:bg-card-dark shadow-2xl p-8 space-y-6">

                    {/* TOP BAR */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1 bg-black/5 dark:bg-white/10 rounded-xl p-1">
                            <LangButton code="ru" label="RU" />
                            <LangButton code="en" label="EN" />
                            <LangButton code="uz" label="UZ" />
                        </div>
                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
                        >
                            {isDarkMode ? <Sun className="text-yellow-400" size={18} /> : <Moon className="text-gray-700" size={18} />}
                        </button>
                    </div>

                    <h2 className="text-2xl font-semibold text-center text-text-light dark:text-text-dark">
                        {t("login.title")}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* USERNAME */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={t("login.username")}
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent border border-gray-300 dark:border-gray-600
                                    focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("login.password")}
                                required
                                disabled={isLoading}
                                className="w-full pl-11 pr-10 py-3 rounded-xl bg-transparent border border-gray-300 dark:border-gray-600
                                    focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-mainColor hover:bg-mainColor/90 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    {t("login.loading")}
                                </>
                            ) : t("login.button")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
