import { useState, useEffect } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Typography } from "@material-tailwind/react";
import { User, Mail, Edit } from "lucide-react";
import { useEditUserMutation } from '@/store/services/user.api';
import { Alert } from "../../../Other/UI/Alert/Alert";
import { useTranslation } from "react-i18next";

export default function UserEditModal({ userData, refresh }) {
    const [open, setOpen] = useState(false);
    const [editUser, { isLoading: isEditing }] = useEditUserMutation();
    const { t } = useTranslation();


    const [editForm, setEditForm] = useState({
        full_name: "",
        username: "",
        email: ""
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Инициализация формы при открытии модалки
    useEffect(() => {
        if (open && userData) {
            setEditForm({
                full_name: userData.full_name || "",
                username: userData.username || "",
                email: userData.email || ""
            });
            setErrors({});
            setSuccessMessage("");
        }
    }, [open, userData]);

    const handleOpen = () => setOpen(!open);

    // Валидация формы
    const validateForm = () => {
        const newErrors = {};

        if (!editForm.full_name.trim()) {
            newErrors.full_name = "Полное имя обязательно";
        }

        if (!editForm.username.trim()) {
            newErrors.username = "Имя пользователя обязательно";
        }

        if (editForm.email && !/\S+@\S+\.\S+/.test(editForm.email)) {
            newErrors.email = "Введите корректный email";
        }

        return newErrors;
    };

    // Обработчик сохранения
    const handleSave = async () => {
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await editUser({
                id: userData.id,
                data: {
                    full_name: editForm.full_name,
                    username: editForm.username,
                    email: editForm.email,
                },
            }).unwrap();

            Alert(t("alert.success"), "success");
            refresh();
            setOpen(false);

        } catch (error) {
            Alert(t("alert.error"), "error");
        }
    };



    // Обработчик изменения поля
    const handleChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Очищаем ошибку при редактировании
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <>
            {/* Кнопка для открытия модалки */}
            <Button
                className="bg-mainColor flex items-center gap-2"
                onClick={handleOpen}
                size="sm"
            >
                <Edit className="h-4 w-4" />
                Редактировать
            </Button>

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="md"
            >
                <DialogHeader className="border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-mainColor" />
                        <Typography variant="h5" className="text-gray-800 dark:text-white">
                            Редактировать профиль
                        </Typography>
                    </div>
                </DialogHeader>

                <DialogBody className="pt-6">
                    {successMessage && (
                        <Alert
                            color="green"
                            className="mb-4"
                            onClose={() => setSuccessMessage("")}
                        >
                            {successMessage}
                        </Alert>
                    )}

                    {errors.submit && (
                        <Alert
                            color="red"
                            className="mb-4"
                            onClose={() => setErrors(prev => ({ ...prev, submit: "" }))}
                        >
                            {errors.submit}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Input
                                label="Полное имя"
                                value={editForm.full_name}
                                onChange={(e) => handleChange("full_name", e.target.value)}
                                error={!!errors.full_name}
                                icon={<User className="h-4 w-4" />}
                                className="dark:text-white dark:bg-gray-800"
                                labelProps={{
                                    className: "dark:text-gray-300"
                                }}
                            />
                            {errors.full_name && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.full_name}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Имя пользователя"
                                value={editForm.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                error={!!errors.username}
                                className="dark:text-white dark:bg-gray-800"
                                labelProps={{
                                    className: "dark:text-gray-300"
                                }}
                            />
                            {errors.username && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.username}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                error={!!errors.email}
                                icon={<Mail className="h-4 w-4" />}
                                className="dark:text-white dark:bg-gray-800"
                                labelProps={{
                                    className: "dark:text-gray-300"
                                }}
                            />
                            {errors.email && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.email}
                                </Typography>
                            )}
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Отмена
                    </Button>
                    <Button
                        className="bg-mainColor"
                        onClick={handleSave}
                        disabled={isEditing}
                    >
                        {isEditing ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}