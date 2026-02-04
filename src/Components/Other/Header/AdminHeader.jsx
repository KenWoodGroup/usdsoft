import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Moon, Sun, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Option, Select } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

export default function AdminHeader({ active, sidebarOpen, ...props }) {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const menuRef = useRef(null);
    const { t, i18n } = useTranslation();


    // Инициализация темы
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);


    const changeLanguage = (lng) => {
        if (lng) {
            i18n.changeLanguage(lng);
            localStorage.setItem("lang", lng);
        }
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Закрытие меню при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            className={`fixed top-[10px] z-30 flex justify-between items-center 
                        mb-6 px-3 py-2 rounded-2xl border shadow-lg 
                        transition-all duration-500 bg-card-light dark:bg-card-dark border-transparent dark:border-white/20`}
            style={{
                width: sidebarOpen ? "calc(99% - 270px)" : "91%",
                left: sidebarOpen ? "270px" : "120px",
            }}
        >
            {/* Левая часть - кнопка меню */}
            <div className="flex items-center gap-5">
                <Button
                    onClick={active}
                    className={`px-4 py-3 rounded-xl transition-all duration-300 bg-mainColor hover:bg-mainColor/90 text-white`}
                >
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            {/* Правая часть - переключатель темы + профиль */}
            <div className="flex items-center gap-4">

                <div className={`w-[80px] rounded-[10px] shadow-lg ${isDarkMode
                    ? "bg-gray-800/80 backdrop-blur-md"
                    : "bg-white/80 backdrop-blur-md"
                    }`}>
                    <Select
                        value={i18n.language || "ru"}
                        onChange={(lng) => changeLanguage(lng)}
                        size="md"
                        color={isDarkMode ? "blue-gray" : "blue"}
                        containerProps={{ className: "!min-w-0 !w-full" }}
                        className={`outline-none ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        labelProps={{
                            className: isDarkMode ? "text-gray-300" : "text-gray-700"
                        }}
                        menuProps={{
                            className: isDarkMode
                                ? "dark:bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        }}
                    >
                        <Option value="ru">Ru</Option>
                        <Option className="my-[2px]" value="en">En</Option>
                        <Option value="uz">Uz</Option>
                    </Select>
                </div>
                {/* Переключатель темы */}
                <button
                    onClick={toggleDarkMode}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl 
                                border shadow transition-all duration-500 border-transparent
                                bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark
                                ${isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"}`}
                    title={isDarkMode ? "Светлый режим" : "Тёмный режим"}
                >
                    {isDarkMode ? (
                        <Sun className="w-5 h-5 text-mainColor transition-transform duration-300" />
                    ) : (
                        <Moon className="w-5 h-5 text-mainColor transition-transform duration-300" />
                    )}
                </button>

                {/* Профиль */}
                <div className="relative flex items-center gap-4" ref={menuRef}>
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        className={`flex items-center gap-3 px-4 py-1 rounded-xl border shadow transition-all duration-300
                                    bg-card-light dark:bg-card-dark border-transparent dark:border-gray-600
                                    text-text-light dark:text-text-dark text-sm font-medium`}
                    >
                        <div className={`p-2 rounded-full bg-background-light dark:bg-background-dark`}>
                            <User className="w-4 h-4" />
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openMenu ? "rotate-180" : ""}`} />
                    </button>

                    {/* Выпадающее меню */}
                    {openMenu && (
                        <div className={`absolute right-0 top-16 w-48 backdrop-blur-xl border shadow-xl rounded-xl py-2 z-50 overflow-hidden
                                        bg-card-light dark:bg-card-dark border-transparent dark:border-gray-600`}>
                            {/* Декоративная полоска */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-background-light dark:bg-background-dark`}></div>

                            <button
                                onClick={() => navigate("/profile")}
                                className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-2
                                            text-text-light dark:text-text-dark hover:bg-mainColor/10`}
                            >
                                <User className="w-4 h-4" />
                                <span>{t('header.profile')}</span>
                            </button>

                            <div className={`h-px my-1 bg-background-light dark:bg-background-dark`}></div>

                            <button
                                onClick={handleLogout}
                                className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-2
                                            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t('header.logout')}</span>
                            </button>
                        </div>
                    )}
                    {props.children}
                </div>
            </div>
        </div>
    );
}
