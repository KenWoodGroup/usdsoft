import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    IconButton,
    Textarea,
    Typography,
} from "@material-tailwind/react";
import { ShoppingCart, X, Package, Trash2, Truck, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function CartModal({
    isOpen,
    onClose,
    selectedProducts,
    onQuantityChange,
    onRemoveProduct,
    onClearCart,
    onCreateOrder,
    isCreatingOrder,
    totalOrderSum,
}) {
    const { t } = useTranslation();

    const [date, setDate] = useState(""); // дата доставки
    const [isLogist, setIsLogist] = useState(null); // логистика: null | true | false
    const [note, setNote] = useState(""); // примечание к заказу

    const handleCreateOrder = () => {
        // Форматируем дату в ISO строку с временем 12:00:00
        let formattedDate = null;
        if (date) {
            formattedDate = `${date}T12:00:00Z`;
        }

        onCreateOrder({
            date: formattedDate,
            is_logist: isLogist,
            note: note.trim() || null, // если пусто - null
        });
    };

    // Проверка валидности формы
    const isFormValid = () => {
        return date && isLogist !== null;
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            handler={onClose}
            size="xl"
            className="bg-white dark:bg-gray-900 rounded-2xl"
        >
            {/* Header */}
            <DialogHeader className="flex items-center justify-between bg-gradient-to-r from-mainColor to-blue-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    <div>
                        <Typography variant="h6">{t("orderCreate.cart.title")}</Typography>
                    </div>
                </div>

                <IconButton variant="text" color="white" onClick={onClose}>
                    <X className="w-5 h-5" />
                </IconButton>
            </DialogHeader>

            {/* Body */}
            <DialogBody className="p-4 bg-gray-50 dark:bg-gray-800/50 max-h-[60vh] overflow-y-auto space-y-4">
                {/* Условия доставки */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Дата */}
                    <div>
                        <Typography
                            variant="small"
                            className="mb-1 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            {t("orderCreate.cart.deliveryDate")} *
                        </Typography>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-mainColor"
                            min={new Date().toISOString().split('T')[0]} // только будущие даты
                            required
                        />
                        <Typography variant="small" className="mt-1 text-gray-500 dark:text-gray-400">
                            {t("orderCreate.cart.deliveryDateHint")}
                        </Typography>
                    </div>

                    {/* Логистика */}
                    <div>
                        <Typography
                            variant="small"
                            className="mb-2 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            {t("orderCreate.cart.needDelivery")} *
                        </Typography>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsLogist(true)}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${isLogist === true
                                    ? "bg-mainColor text-white border-mainColor"
                                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-mainColor"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    {t("orderCreate.cart.needDelivery")} — Да
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsLogist(false)}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${isLogist === false
                                    ? "bg-gray-800 text-white border-gray-800 dark:bg-gray-700"
                                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-800"
                                    }`}
                            >
                                {t("orderCreate.cart.needDelivery")} — Нет
                            </button>
                        </div>
                    </div>

                    {/* Примечание */}
                    <div>
                        <Typography
                            variant="small"
                            className="mb-1 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            <FileText className="w-4 h-4 inline mr-1" />
                            {t("orderCreate.cart.note")}
                        </Typography>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t("orderCreate.cart.notePlaceholder")}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-mainColor resize-none"
                            rows={3}
                        />
                        <Typography variant="small" className="mt-1 text-gray-500 dark:text-gray-400">
                            {t("orderCreate.cart.noteHint")}
                        </Typography>
                    </div>
                </div>

                {/* Список товаров */}
                {selectedProducts.length === 0 ? (
                    <div className="text-center py-10">
                        <Package className="w-12 h-12 mx-auto mb-3 text-mainColor dark:text-blue-400" />
                        <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                            {t("orderCreate.cart.empty")}
                        </Typography>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-mainColor text-white">
                                        <Package className="w-4 h-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <Typography variant="small" className="font-medium truncate">
                                            {product.name || t("orderCreate.manualAdd.namePlaceholder")}
                                        </Typography>

                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {product.unit && (
                                                <span className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:text-text-dark dark:bg-blue-900/30">
                                                    {product.unit}
                                                </span>
                                            )}
                                            {product.factory_name && (
                                                <span className="px-2 py-0.5 text-xs rounded bg-gray-200 dark:text-text-dark dark:bg-gray-700">
                                                    {product.factory_name}
                                                </span>
                                            )}
                                            {product.isManual && (
                                                <span className="px-2 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                                    {t("orderCreate.cart.manualLabel")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={product.quantity}
                                        onChange={(e) => onQuantityChange(product.id, e.target.value)}
                                        className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:text-text-dark dark:bg-gray-800 focus:ring-2 focus:ring-mainColor"
                                        placeholder="0"
                                    />
                                    <IconButton color="red" onClick={() => onRemoveProduct(product.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogBody>

            {/* Footer */}
            {selectedProducts.length > 0 && (
                <DialogFooter className="flex flex-col gap-3 border-t">
                    <div className="w-full flex justify-between font-medium">
                        <span>{t("orderCreate.cart.totalItems")}:</span>
                        <span>{totalOrderSum.toLocaleString("ru-RU")} сум</span>
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button variant="outlined" color="red" fullWidth onClick={onClearCart}>
                            {t("orderCreate.cart.clearButton")}
                        </Button>

                        <Button
                            fullWidth
                            color="blue"
                            onClick={handleCreateOrder}
                            loading={isCreatingOrder}
                            disabled={!isFormValid()}
                        >
                            {isCreatingOrder
                                ? t("orderCreate.cart.creatingOrder")
                                : t("orderCreate.cart.createOrderButton")}
                        </Button>
                    </div>
                </DialogFooter>
            )}
        </Dialog>
    );
}