import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Typography,
} from "@material-tailwind/react";
import { Key, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { useChangePasswordMutation } from "@/store/services/user.api";
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2';

export default function EditPassword({ userData }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const [passwordForm, setPasswordForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ""
    });

    // Сброс формы при открытии/закрытии модалки
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setPasswordForm({
            old_password: "",
            new_password: "",
            confirm_password: "",
        });
        setShowPasswords({
            old: false,
            new: false,
            confirm: false,
        });
        setErrors({});
        setPasswordStrength({
            score: 0,
            message: ""
        });
    };

    const handleOpen = () => setOpen(!open);

    // Проверка сложности пароля
    const checkPasswordStrength = (password) => {
        if (!password) {
            return { score: 0, message: "" };
        }

        let score = 0;
        const messages = [];

        // Длина пароля
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;

        // Содержит цифры
        if (/\d/.test(password)) score += 1;

        // Содержит строчные буквы
        if (/[a-z]/.test(password)) score += 1;

        // Содержит заглавные буквы
        if (/[A-Z]/.test(password)) score += 1;

        // Содержит специальные символы
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

        // Определяем сообщение
        if (score === 0) {
            messages.push(t("passwordChange.passwordStrength.enterPassword"));
        } else if (score <= 2) {
            messages.push(t("passwordChange.passwordStrength.weak"));
        } else if (score <= 4) {
            messages.push(t("passwordChange.passwordStrength.medium"));
        } else {
            messages.push(t("passwordChange.passwordStrength.strong"));
        }

        return {
            score,
            message: messages.join(", "),
            color: score <= 2 ? "red" : score <= 4 ? "amber" : "green"
        };
    };

    // Валидация формы
    const validateForm = () => {
        const newErrors = {};

        if (!passwordForm.old_password) {
            newErrors.old_password = t("passwordChange.validation.oldPasswordRequired");
        }

        if (!passwordForm.new_password) {
            newErrors.new_password = t("passwordChange.validation.newPasswordRequired");
        } else if (passwordForm.new_password.length < 6) {
            newErrors.new_password = t("passwordChange.validation.minimumCharacters");
        } else if (passwordForm.old_password === passwordForm.new_password) {
            newErrors.new_password = t("passwordChange.validation.sameAsOld");
        }

        if (!passwordForm.confirm_password) {
            newErrors.confirm_password = t("passwordChange.validation.confirmPasswordRequired");
        } else if (passwordForm.new_password !== passwordForm.confirm_password) {
            newErrors.confirm_password = t("passwordChange.validation.passwordsDontMatch");
        }

        return newErrors;
    };

    // Смена пароля
    const handleChangePassword = async () => {
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Подтверждение смены пароля
        const result = await Swal.fire({
            title: t("passwordChange.confirmation.title"),
            text: t("passwordChange.confirmation.message"),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t("passwordChange.confirmation.confirmButton"),
            cancelButtonText: t("passwordChange.confirmation.cancelButton"),
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        try {
            await changePassword({
                id: userData.id,
                data: {
                    old_password: passwordForm.old_password,
                    new_password: passwordForm.new_password,
                },
            }).unwrap();

            // Успешное уведомление
            await Swal.fire({
                icon: 'success',
                title: t("passwordChange.success.title"),
                text: t("passwordChange.success.message"),
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            });

            setOpen(false);

        } catch (error) {
            console.error('Password change error:', error);

            // Более информативное сообщение об ошибке
            let errorMessage = t("passwordChange.error.default");

            if (error?.data?.message) {
                if (error.data.message.includes("старый пароль") ||
                    error.data.message.includes("old password") ||
                    error.data.message.includes("incorrect")) {
                    errorMessage = t("passwordChange.error.incorrectOldPassword");
                } else if (error.data.message.includes("слабый") ||
                    error.data.message.includes("weak") ||
                    error.data.message.includes("password is too common")) {
                    errorMessage = t("passwordChange.error.weakPassword");
                } else {
                    errorMessage = error.data.message;
                }
            }

            await Swal.fire({
                icon: 'error',
                title: t("passwordChange.error.title"),
                text: errorMessage,
                confirmButtonText: t("passwordChange.error.confirmButton"),
                confirmButtonColor: '#dc2626',
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleChange = (field, value) => {
        setPasswordForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Проверяем сложность пароля при изменении нового пароля
        if (field === "new_password") {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Очищаем ошибку при вводе
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Определяем цвет индикатора силы пароля
    const getStrengthColor = () => {
        if (passwordStrength.score === 0) return "bg-gray-300";
        if (passwordStrength.score <= 2) return "bg-red-500";
        if (passwordStrength.score <= 4) return "bg-amber-500";
        return "bg-green-500";
    };

    return (
        <>
            {/* Кнопка */}
            <Button
                className="bg-amber-500 hover:bg-amber-600 flex items-center gap-2 transition-colors duration-200"
                onClick={handleOpen}
                size="sm"
                variant="filled"
            >
                <Lock className="h-4 w-4" />
                {t("passwordChange.button")}
            </Button>

            {/* Модалка */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="md"
                className="bg-white dark:bg-gray-900"
            >
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Key className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <Typography variant="h5" className="text-gray-900 dark:text-gray-100">
                                {t("passwordChange.title")}
                            </Typography>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                {userData?.name || userData?.email}
                            </Typography>
                        </div>
                    </div>
                </DialogHeader>

                <DialogBody className="pt-6 space-y-6">
                    {/* Старый пароль */}
                    <div className="space-y-2">
                        <Typography variant="small" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t("passwordChange.fields.oldPassword")} *
                        </Typography>
                        <div className="relative">
                            <Input
                                label={t("passwordChange.placeholders.enterCurrentPassword")}
                                type={showPasswords.old ? "text" : "password"}
                                value={passwordForm.old_password}
                                onChange={(e) => handleChange("old_password", e.target.value)}
                                error={!!errors.old_password}
                                className="pr-10"
                                color="blue-gray"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                onClick={() => togglePasswordVisibility("old")}
                                aria-label={
                                    showPasswords.old
                                        ? t("passwordChange.accessibility.hidePassword")
                                        : t("passwordChange.accessibility.showPassword")
                                }
                            >
                                {showPasswords.old ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.old_password && (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.old_password}</span>
                            </div>
                        )}
                    </div>

                    {/* Новый пароль */}
                    <div className="space-y-2">
                        <Typography variant="small" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t("passwordChange.fields.newPassword")} *
                        </Typography>
                        <div className="relative">
                            <Input
                                label={t("passwordChange.placeholders.enterNewPassword")}
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.new_password}
                                onChange={(e) => handleChange("new_password", e.target.value)}
                                error={!!errors.new_password}
                                className="pr-10"
                                color="blue-gray"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                onClick={() => togglePasswordVisibility("new")}
                                aria-label={
                                    showPasswords.new
                                        ? t("passwordChange.accessibility.hidePassword")
                                        : t("passwordChange.accessibility.showPassword")
                                }
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Индикатор силы пароля */}
                        {passwordForm.new_password && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className={`font-medium ${passwordStrength.color === "red" ? "text-red-600" :
                                            passwordStrength.color === "amber" ? "text-amber-600" :
                                                "text-green-600"
                                        }`}>
                                        {passwordStrength.message}
                                    </span>
                                    <span className="text-gray-500">
                                        {passwordStrength.score}/6
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {errors.new_password && (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.new_password}</span>
                            </div>
                        )}
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="space-y-2">
                        <Typography variant="small" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t("passwordChange.fields.confirmPassword")} *
                        </Typography>
                        <div className="relative">
                            <Input
                                label={t("passwordChange.placeholders.repeatNewPassword")}
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirm_password}
                                onChange={(e) => handleChange("confirm_password", e.target.value)}
                                error={!!errors.confirm_password}
                                className="pr-10"
                                color="blue-gray"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                onClick={() => togglePasswordVisibility("confirm")}
                                aria-label={
                                    showPasswords.confirm
                                        ? t("passwordChange.accessibility.hidePassword")
                                        : t("passwordChange.accessibility.showPassword")
                                }
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.confirm_password}</span>
                            </div>
                        )}
                    </div>

                    {/* Требования к паролю */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <Typography variant="small" className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                            {t("passwordChange.requirements.title")}:
                        </Typography>
                        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${passwordForm.new_password?.length >= 6 ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                {t("passwordChange.requirements.minimumLength")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(passwordForm.new_password) ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                {t("passwordChange.requirements.uppercaseLetters")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(passwordForm.new_password) ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                {t("passwordChange.requirements.numbers")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.new_password) ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                {t("passwordChange.requirements.specialCharacters")}
                            </li>
                        </ul>
                    </div>
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 gap-2">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        className="bg-amber-500 hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleChangePassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {t("common.changing")}
                            </div>
                        ) : (
                            t("passwordChange.button")
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}