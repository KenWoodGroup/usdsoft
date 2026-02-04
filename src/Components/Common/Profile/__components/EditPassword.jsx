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
import { Key, Eye, EyeOff } from "lucide-react";
import { useChangePasswordMutation } from "@/store/services/user.api";
import { Alert } from "../../../Other/UI/Alert/Alert";

export default function EditPassword({ userData }) {
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

    // Сброс формы при открытии модалки
    useEffect(() => {
        if (open) {
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
        }
    }, [open]);

    const handleOpen = () => setOpen(!open);

    // Валидация
    const validateForm = () => {
        const newErrors = {};

        if (!passwordForm.old_password) {
            newErrors.old_password = "Введите старый пароль";
        }

        if (!passwordForm.new_password) {
            newErrors.new_password = "Введите новый пароль";
        } else if (passwordForm.new_password.length < 6) {
            newErrors.new_password = "Минимум 6 символов";
        }

        if (!passwordForm.confirm_password) {
            newErrors.confirm_password = "Подтвердите пароль";
        } else if (passwordForm.new_password !== passwordForm.confirm_password) {
            newErrors.confirm_password = "Пароли не совпадают";
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

        try {
            await changePassword({
                id: userData.id,
                data: {
                    old_password: passwordForm.old_password,
                    new_password: passwordForm.new_password,
                },
            }).unwrap();

            Alert("Пароль успешно изменён", "success");
            setOpen(false);

        } catch (error) {
            Alert(
                error?.data?.message || "Ошибка при смене пароля",
                "error"
            );
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

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <>
            {/* Кнопка */}
            <Button
                className="bg-amber-500 flex items-center gap-2"
                onClick={handleOpen}
                size="sm"
            >
                <Key className="h-4 w-4" />
                Сменить пароль
            </Button>

            {/* Модалка */}
            <Dialog open={open} handler={handleOpen} size="md">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-amber-500" />
                        <Typography variant="h5">
                            Сменить пароль
                        </Typography>
                    </div>
                </DialogHeader>

                <DialogBody className="pt-6 space-y-4">
                    {/* Старый пароль */}
                    <div>
                        <div className="relative">
                            <Input
                                label="Старый пароль"
                                type={showPasswords.old ? "text" : "password"}
                                value={passwordForm.old_password}
                                onChange={(e) =>
                                    handleChange("old_password", e.target.value)
                                }
                                error={!!errors.old_password}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("old")}
                            >
                                {showPasswords.old ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.old_password && (
                            <Typography variant="small" color="red">
                                {errors.old_password}
                            </Typography>
                        )}
                    </div>

                    {/* Новый пароль */}
                    <div>
                        <div className="relative">
                            <Input
                                label="Новый пароль"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.new_password}
                                onChange={(e) =>
                                    handleChange("new_password", e.target.value)
                                }
                                error={!!errors.new_password}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("new")}
                            >
                                {showPasswords.new ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.new_password && (
                            <Typography variant="small" color="red">
                                {errors.new_password}
                            </Typography>
                        )}
                    </div>

                    {/* Подтверждение */}
                    <div>
                        <div className="relative">
                            <Input
                                label="Подтвердите пароль"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirm_password}
                                onChange={(e) =>
                                    handleChange("confirm_password", e.target.value)
                                }
                                error={!!errors.confirm_password}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => togglePasswordVisibility("confirm")}
                            >
                                {showPasswords.confirm ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <Typography variant="small" color="red">
                                {errors.confirm_password}
                            </Typography>
                        )}
                    </div>
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Отмена
                    </Button>
                    <Button
                        className="bg-amber-500"
                        onClick={handleChangePassword}
                        disabled={isLoading}
                    >
                        {isLoading ? "Изменение..." : "Сменить пароль"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
