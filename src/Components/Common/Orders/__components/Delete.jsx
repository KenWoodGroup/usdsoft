import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Spinner,
    Typography
} from "@material-tailwind/react";
import { Trash } from "lucide-react";
import { useDeleteOrdersMutation } from "../../../../store/services/Order.api";
import { Alert } from "../../../Other/UI/Alert/Alert";

export default function Delete({ orderId, refresh }) {
    const [open, setOpen] = useState(false);
    const [deleteOrder, { isLoading, error }] = useDeleteOrdersMutation();

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            await deleteOrder(orderId).unwrap();
            refresh?.();
            handleOpen();
            Alert(t("alert.success"), "success");

        } catch (err) {
            console.error("Ошибка при удалении:", err);
            Alert(t("alert.error"), "error");

        }
    };

    return (
        <>
            {/* Кнопка удаления */}
            <Button
                size="sm"
                onClick={handleOpen}
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
            >
                <Trash className="w-4 h-4" />
            </Button>
            {/* Модальное окно подтверждения */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark"
            >
                <DialogHeader className="text-text-light dark:text-text-dark text-center">
                    <Typography variant="h4">
                        Подтверждение удаления
                    </Typography>
                </DialogHeader>

                <DialogBody className="text-text-light dark:text-text-dark">
                    <div className="flex flex-col items-center justify-center pb-4">

                        <Typography variant="h6" className="text-left mb-2">
                            Вы уверены, что хотите удалить этот заказ?
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400 text-center">
                            Это действие невозможно отменить. Все данные заказа будут удалены безвозвратно.
                        </Typography>
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outlined"
                        onClick={handleOpen}
                        disabled={isLoading}
                        className="border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Spinner className="h-4 w-4" />
                                Удаление...
                            </>
                        ) : (
                            <>
                                <Trash className="w-4 h-4" />
                                Удалить
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
