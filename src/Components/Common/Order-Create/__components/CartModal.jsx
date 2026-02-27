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
import { ShoppingCart, X, Package, Trash2, Truck, FileText, Building2 } from "lucide-react";
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
    const [address, setAddress] = useState(""); // адрес доставки

    const handleCreateOrder = () => {
        // Форматируем дату в ISO строку с временем 12:00:00
        let formattedDate = null;
        if (date) {
            formattedDate = `${date}T12:00:00Z`;
        }

        onCreateOrder({
            date: formattedDate,
            is_logist: isLogist,
            address: address.trim(),
            note: note.trim() || null, // если пусто - null
        });
    };

    // Проверка валидности формы
    const isFormValid = () => {
        return date && isLogist !== null && address.trim() !== "";
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
            <DialogBody className="p-4 bg-gray-50 dark:bg-gray-800/50 max-h-[60vh] overflow-y-auto space-y-6">
                {/* Условия доставки */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <Truck className="w-5 h-5 text-mainColor" />
                        <Typography variant="h6" className="text-gray-900 dark:text-gray-100 text-sm font-bold uppercase tracking-wider">
                            {t("orderCreate.notifications.orderCreated.logistics")}
                        </Typography>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Дата */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                                <FileText className="w-3.5 h-3.5" />
                                {t("orderCreate.cart.deliveryDate")}
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-mainColor transition-all"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Логистика */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                                <Truck className="w-3.5 h-3.5" />
                                {t("orderCreate.cart.needDelivery")}
                            </label>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLogist(true)}
                                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${isLogist === true
                                        ? "bg-mainColor text-white border-mainColor ring-2 ring-blue-100 dark:ring-blue-900/30"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-mainColor"
                                        }`}
                                >
                                    {t("common.yes")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsLogist(false)}
                                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${isLogist === false
                                        ? "bg-gray-800 text-white border-gray-800 dark:bg-gray-700 ring-2 ring-gray-100 dark:ring-gray-800"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-800"
                                        }`}
                                >
                                    {t("common.no")}
                                </button>
                            </div>
                        </div>

                        {/* Адрес доставки */}
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                                <Building2 className="w-3.5 h-3.5" />
                                {t("orderCreate.cart.address")}
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={t("orderCreate.cart.addressPlaceholder")}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-mainColor transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Примечание */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
                        <FileText className="w-3.5 h-3.5" />
                        {t("orderCreate.cart.note")}
                    </label>
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t("orderCreate.cart.notePlaceholder")}
                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-mainColor resize-none shadow-sm transition-all"
                        rows={2}
                    />
                </div>

                <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-4 h-4 text-mainColor" />
                        <Typography variant="small" className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {t("orderCreate.productList.title")}
                        </Typography>
                    </div>
                </div>

                {/* Список товаров */}
                <div className="space-y-4">
                    {selectedProducts.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                                {t("orderCreate.cart.empty")}
                            </Typography>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:border-mainColor/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-mainColor">
                                            <Package className="w-5 h-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <Typography variant="small" className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                                {product.name || t("orderCreate.manualAdd.namePlaceholder")}
                                            </Typography>

                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                {product.unit && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-50 dark:bg-blue-900/30 text-mainColor border border-blue-100 dark:border-blue-800">
                                                        {product.unit}
                                                    </span>
                                                )}
                                                {product.factory_name && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                        {product.factory_name}
                                                    </span>
                                                )}
                                                {product.isManual && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                        {t("orderCreate.cart.manualLabel")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-9">
                                            <input
                                                type="number"
                                                min="0"
                                                value={product.quantity}
                                                onChange={(e) => onQuantityChange(product.id, e.target.value)}
                                                className="w-16 h-full px-2 text-sm text-center bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <IconButton
                                            variant="text"
                                            color="red"
                                            onClick={() => onRemoveProduct(product.id)}
                                            className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogBody>

            {/* Footer */}
            {selectedProducts.length > 0 && (
                <DialogFooter className="flex flex-col gap-4 p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="w-full flex justify-between items-center">
                        <Typography className="text-gray-600 dark:text-gray-400 font-medium">
                            {t("orderCreate.cart.totalItems")}:
                        </Typography>
                        <Typography className="text-xl font-black text-mainColor">
                            {totalOrderSum.toLocaleString("ru-RU")} сум
                        </Typography>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button
                            variant="text"
                            color="red"
                            onClick={onClearCart}
                            className="flex-1 rounded-xl font-bold uppercase tracking-wider text-xs"
                        >
                            {t("orderCreate.cart.clearButton")}
                        </Button>

                        <Button
                            onClick={handleCreateOrder}
                            loading={isCreatingOrder}
                            disabled={!isFormValid()}
                            className="flex-[2] bg-mainColor rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-mainColor/20"
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