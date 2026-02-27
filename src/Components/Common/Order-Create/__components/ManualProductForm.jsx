import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function ManualProductForm({ onClose, onAddManualProduct }) {
    const { t } = useTranslation();
    const [manualProduct, setManualProduct] = useState({
        name: '',
        quantity: '',
        unit: '',
        price: '',
        notes: ''
    });

    const handleManualProductChange = (e) => {
        const { name, value } = e.target;
        setManualProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddManualProduct = () => {
        if (!manualProduct.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: t('orderCreate.validation.nameRequired'),
                text: '',
                confirmButtonText: 'OK',
            });
            return;
        }

        const productId = `manual-${Date.now()}`;
        const manualProductData = {
            id: productId,
            product_id: null,
            name: manualProduct.name,
            quantity: manualProduct.quantity || '',
            purchase_price: manualProduct.price || 0,
            unit: manualProduct.unit || '',
            notes: manualProduct.notes || '',
            isManual: true,
            factory_id: null,
            factory_name: t('orderCreate.factories.manual')
        };

        onAddManualProduct(manualProductData);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: t('orderCreate.notifications.manualProductAdded'),
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 animate-slideDown">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Plus className="w-5 h-5 text-mainColor dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-text-light dark:text-text-dark">
                            {t('orderCreate.manualAdd.title')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('orderCreate.search.addManualTooltip')}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-text-light dark:hover:text-text-dark transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('orderCreate.manualAdd.nameLabel')}
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={manualProduct.name}
                        onChange={handleManualProductChange}
                        className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                        placeholder={t('orderCreate.manualAdd.namePlaceholder')}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderCreate.manualAdd.quantityLabel')}
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={manualProduct.quantity}
                            onChange={handleManualProductChange}
                            className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                            placeholder="0"
                            min="0"
                            step="1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderCreate.manualAdd.priceLabel')}
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={manualProduct.price}
                            onChange={handleManualProductChange}
                            className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('orderCreate.manualAdd.unitLabel')}
                        </label>
                        <select
                            name="unit"
                            value={manualProduct.unit}
                            onChange={handleManualProductChange}
                            className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                        >
                            <option value="">{t('orderCreate.manualAdd.unitOptions.none')}</option>
                            <option value="шт">{t('orderCreate.manualAdd.unitOptions.piece')}</option>
                            <option value="кг">{t('orderCreate.manualAdd.unitOptions.kg')}</option>
                            <option value="л">{t('orderCreate.manualAdd.unitOptions.litre')}</option>
                            <option value="м">{t('orderCreate.manualAdd.unitOptions.meter')}</option>
                            <option value="м²">{t('orderCreate.manualAdd.unitOptions.m2')}</option>
                            <option value="м³">{t('orderCreate.manualAdd.unitOptions.m3')}</option>
                            <option value="упак">{t('orderCreate.manualAdd.unitOptions.pack')}</option>
                            <option value="рулон">{t('orderCreate.manualAdd.unitOptions.roll')}</option>
                            <option value="мешок">{t('orderCreate.manualAdd.unitOptions.bag')}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('orderCreate.manualAdd.notesLabel')}
                    </label>
                    <textarea
                        name="notes"
                        value={manualProduct.notes}
                        onChange={handleManualProductChange}
                        className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark resize-none min-h-[100px]"
                        placeholder={t('orderCreate.manualAdd.notesPlaceholder')}
                        rows={3}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleAddManualProduct}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-mainColor hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        {t('orderCreate.manualAdd.addButton')}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                        {t('orderCreate.manualAdd.cancelButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}