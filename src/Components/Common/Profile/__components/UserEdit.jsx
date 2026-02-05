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
import { User, Mail, Edit } from "lucide-react";
import { useEditUserMutation } from "@/store/services/user.api";
import { Alert } from "../../../Other/UI/Alert/Alert";
import { useTranslation } from "react-i18next";

export default function UserEditModal({ userData, refresh }) {
    const [open, setOpen] = useState(false);
    const [editUser, { isLoading: isEditing }] = useEditUserMutation();
    const { t } = useTranslation();

    const [editForm, setEditForm] = useState({
        full_name: "",
        username: "",
        email: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Инициализация формы при открытии модалки
    useEffect(() => {
        if (open && userData) {
            setEditForm({
                full_name: userData.full_name || "",
                username: userData.username || "",
                email: userData.email || "",
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
            newErrors.full_name = t("userEdit.validation.fullNameRequired");
        }

        if (!editForm.username.trim()) {
            newErrors.username = t("userEdit.validation.usernameRequired");
        }

        if (editForm.email && !/\S+@\S+\.\S+/.test(editForm.email)) {
            newErrors.email = t("userEdit.validation.invalidEmail");
        }

        return newErrors;
    };

    // Сохранение
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

            Alert(t("userEdit.notifications.success"), "success");
            refresh();
            setOpen(false);
        } catch (error) {
            Alert(t("userEdit.notifications.error"), "error");
        }
    };

    const handleChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <>
            {/* Кнопка открыть модал */}
            <Button
                className="bg-mainColor flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={handleOpen}
                size="sm"
            >
                <Edit className="h-4 w-4" />
                {t("userEdit.button.edit")}
            </Button>

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="md"
                className="bg-background-light dark:bg-background-dark rounded-2xl dark:border-white/20"
            >
                {/* Header */}
                <DialogHeader className="flex items-center justify-between bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 rounded-t-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-mainColor dark:text-blue-400" />
                        <Typography className="text-gray-800 dark:text-white font-semibold">
                            {t("userEdit.title")}
                        </Typography>
                    </div>
                </DialogHeader>

                {/* Body */}
                <DialogBody className="px-4 py-6 space-y-4 bg-background-light dark:bg-background-dark max-h-[60vh] overflow-y-auto">


                    {/* Поля формы */}
                    <div className="space-y-4">
                        <div>
                            <Input
                                label={t("userEdit.form.fullName")}
                                value={editForm.full_name}
                                onChange={(e) => handleChange("full_name", e.target.value)}
                                error={!!errors.full_name}
                                color="blue-gray"
                                icon={<User className="h-4 w-4" />}
                                className="dark:bg-card-dark dark:text-white"
                                labelProps={{ className: "dark:text-gray-300" }}
                            />
                            {errors.full_name && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.full_name}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label={t("userEdit.form.username")}
                                value={editForm.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                error={!!errors.username}
                                className="dark:bg-card-dark dark:text-white"
                                color="blue-gray"
                                labelProps={{ className: "dark:text-gray-300" }}
                            />
                            {errors.username && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.username}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label={t("userEdit.form.email")}
                                type="email"
                                value={editForm.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                error={!!errors.email}
                                icon={<Mail className="h-4 w-4" />}
                                color="blue-gray"
                                className="dark:bg-card-dark dark:text-white"
                                labelProps={{ className: "dark:text-gray-300" }}
                            />
                            {errors.email && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.email}
                                </Typography>
                            )}
                        </div>
                    </div>
                </DialogBody>

                {/* Footer */}
                <DialogFooter className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-background-light dark:bg-background-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {t("userEdit.button.cancel")}
                    </Button>
                    <Button
                        className="bg-mainColor dark:bg-blue-700 dark:hover:bg-blue-600"
                        onClick={handleSave}
                        disabled={isEditing}
                    >
                        {isEditing
                            ? t("userEdit.button.saving")
                            : t("userEdit.button.save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
