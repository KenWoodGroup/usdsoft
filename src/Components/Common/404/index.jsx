// pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
    const navigate = useNavigate();
    const { t } = useTranslation(); // хук для перевода

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500 px-4">
            <div className="text-center max-w-lg">
                <h1 className="text-9xl font-extrabold text-mainColor mb-6">{t("notfound.title")}</h1>
                <p className="text-xl sm:text-2xl font-semibold text-text-light dark:text-text-dark mb-8">
                    {t("notfound.heading")}
                </p>
                <p className="text-text-light/70 dark:text-text-dark/70 mb-12">
                    {t("notfound.description")}
                </p>

                <div className="flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 bg-mainColor text-white rounded-lg shadow-lg hover:bg-mainColor/90 transition-all duration-300"
                    >
                        {t("notfound.buttons.login")}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-mainColor text-mainColor rounded-lg shadow-lg hover:bg-mainColor/10 transition-all duration-300"
                    >
                        {t("notfound.buttons.back")}
                    </button>
                </div>
            </div>
        </div>
    );
}
