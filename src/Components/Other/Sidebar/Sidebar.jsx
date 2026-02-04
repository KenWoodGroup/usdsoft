// components/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Card, Typography } from "@material-tailwind/react";
import { SIDEBAR_CONFIG } from "../../../app/navigation/sidebar.config";
import { useTranslation } from "react-i18next";

export default function Sidebar({ open }) {
    // Получаем роль из cookies
    const role = Cookies.get("role"); // если нет cookie, по умолчанию 'user'
    const location = useLocation();

    const { t, i18n } = useTranslation();
    // Фильтруем доступные пункты меню по роли
    const filteredMenuItems = SIDEBAR_CONFIG.filter(item => item.roles.includes(role));

    return (
        <Card
            className={`h-[95%] fixed top-[10px] left-[15px] z-50 shadow-xl bg-card-light dark:bg-card-dark backdrop-blur-md border border-white/20 px-4 py-6 overflow-y-auto transition-all duration-500
                ${open ? "w-[100px]" : "w-[250px]"}
            `}
        >
            <div className="flex items-center justify-center mb-6">
                {/* Логотип или аватар */}
            </div>

            <div className="flex flex-col gap-6">

                <div className="flex flex-col gap-2">
                    {filteredMenuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center ${open && 'justify-center'} gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300
                                ${isActive
                                    ? "bg-mainColor/20 text-mainColor font-semibold shadow-md"
                                    : "text-text-light dark:text-text-dark hover:bg-mainColor/10 hover:text-mainColor"
                                }`
                            }
                        >
                            <span className="w-6 h-6 text-text-light dark:text-text-dark">
                                <item.icon />
                            </span>
                            {!open && <span className="text-sm">{t(item.label)}</span>}
                        </NavLink>
                    ))}
                </div>
            </div>
        </Card>
    );
}
