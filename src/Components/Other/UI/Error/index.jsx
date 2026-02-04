import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Error({ message }) {
    const { t } = useTranslation();

    return (
        <div
            className="
        flex items-center justify-center h-[600px]
        bg-background-light dark:bg-background-dark
        px-4
      "
        >
            <div
                className="
          max-w-md w-full
          rounded-3xl
          bg-card-light dark:bg-card-dark
          shadow-xl
          p-8
          text-center
          border border-red-100 dark:border-red-500/20
        "
            >
                {/* ICON */}
                <div className="flex justify-center mb-5">
                    <div
                        className="
              flex items-center justify-center
              w-16 h-16 rounded-full
              bg-red-100 dark:bg-red-500/10
            "
                    >
                        <AlertTriangle
                            size={34}
                            className="text-red-600 dark:text-red-400"
                        />
                    </div>
                </div>

                {/* TITLE */}
                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                    {t("error.title")}
                </h2>

                {/* MESSAGE */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {message || t("error.defaultMessage")}
                </p>
            </div>
        </div>
    );
}
