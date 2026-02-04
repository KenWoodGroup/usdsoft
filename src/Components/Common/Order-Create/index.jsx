'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStockGetSearchQuery } from '@/store/services/stock.api';
import { useCreateOrderMutation } from '@/store/services/order.api';
import Loading from '../../Other/UI/Loadings/Loading';
import Error from '../../Other/UI/Error';
import debounce from 'lodash/debounce';
import { SearchIcon, ChevronLeft, ChevronRight, Package, ShoppingCart, CheckCircle, Plus, X, Edit2, Send, Trash2, ChevronsLeft, ChevronsRight, Hash, DollarSign, Box, FileText, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

export default function OrderCreate() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [manualProduct, setManualProduct] = useState({
        name: '',
        quantity: '',
        unit: '',
        notes: ''
    });

    // Запрос данных товаров с пагинацией
    const { data, isLoading, error } = useStockGetSearchQuery({
        search: searchTerm,
        page: page
    });

    // Mutation для создания заказа
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

    // Дебаунс для поиска
    const debouncedSearch = useCallback(
        debounce((value) => {
            setPage(1);
        }, 500),
        []
    );

    // Обработчик изменения поиска
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Данные из API
    const products = useMemo(() => {
        return data?.data || [];
    }, [data]);

    // Данные пагинации из API
    const pagination = useMemo(() => {
        return data?.pagination || {
            totalCount: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 15
        };
    }, [data]);

    // Обработчик изменения страницы
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Обработчик выбора/отмены выбора продукта
    const handleProductSelect = (product) => {
        const productId = product.product_id || product.id;
        const productName = product.product?.name || product.name;
        const unit = product.unit || product.product?.unit || '';

        if (selectedProducts.some(p => p.product_id === productId && !p.isManual)) {
            setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
        } else {
            const newProduct = {
                id: productId,
                product_id: productId,
                name: productName,
                quantity: '',
                unit: unit,
                purchase_price: product.purchase_price,
                isManual: false
            };

            setSelectedProducts(prev => [...prev, newProduct]);

            // Показываем уведомление
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: t('orderCreate.notifications.productAdded'),
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        }
    };

    // Обновление количества для выбранного товара
    const handleQuantityChange = (productId, quantity) => {
        if (quantity === '' || (quantity >= 0 && quantity <= 999999)) {
            setSelectedProducts(prev =>
                prev.map(product =>
                    product.id === productId
                        ? { ...product, quantity: quantity === '' ? '' : Number(quantity) }
                        : product
                )
            );
        }
    };

    // Удаление продукта из выбранных
    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    // Обработчик изменения ручного ввода продукта
    const handleManualProductChange = (e) => {
        const { name, value } = e.target;
        setManualProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Добавление товара вручную
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
            unit: manualProduct.unit || '',
            notes: manualProduct.notes || '',
            isManual: true
        };

        setSelectedProducts(prev => [...prev, manualProductData]);
        setManualProduct({
            name: '',
            quantity: '',
            unit: '',
            notes: ''
        });
        setShowManualAdd(false);

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

    // Подготовка данных для отправки заказа
    const prepareOrderData = (userData) => {
        const items = selectedProducts.map(product => {
            if (product.isManual) {
                return {
                    product_name: product.name,
                    quantity: product.quantity || 0
                };
            }

            return {
                product_id: product.product_id,
                product_name: product.name,
                quantity: product.quantity || 0
            };
        });

        return {
            ...userData,
            items: items
        };
    };

    // Создание заказа
    const handleCreateOrder = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: t('orderCreate.notifications.noProducts'),
                text: '',
                confirmButtonText: 'OK',
            });
            return;
        }

        const productsWithoutQuantity = selectedProducts.filter(p => !p.quantity && p.quantity !== 0);
        if (productsWithoutQuantity.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: t('orderCreate.notifications.missingQuantity.title'),
                html: `
                    <div class="space-y-2">
                        <p class="text-slate-700 dark:text-slate-300">${t('orderCreate.notifications.missingQuantity.message')}:</p>
                        <ul class="text-left text-sm text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto">
                            ${productsWithoutQuantity.map(p => `<li class="py-1">• ${p.name}</li>`).join('')}
                        </ul>
                    </div>
                `,
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            const userData = {
                location_id: Cookies?.get(`location_id`)
            };

            const orderDataToSend = prepareOrderData(userData);

            Swal.fire({
                title: t('orderCreate.notifications.creatingOrder.title'),
                text: t('orderCreate.notifications.creatingOrder.message'),
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await createOrder(orderDataToSend).unwrap();

            Swal.fire({
                icon: 'success',
                title: t('orderCreate.notifications.orderCreated.title'),
                html: `
                    <div class="space-y-4">
                        <p class="text-slate-700 dark:text-slate-300">${t('orderCreate.notifications.orderCreated.message')}</p>
                        <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">${t('orderCreate.notifications.orderCreated.details')}:</p>
                            <p class="text-slate-700 dark:text-slate-300 text-sm">${t('orderCreate.notifications.orderCreated.itemsCount')}: ${selectedProducts.length}</p>
                            <p class="text-slate-700 dark:text-slate-300 text-sm mt-1">${t('orderCreate.notifications.orderCreated.totalSum')}: ${selectedProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchase_price || 0)), 0).toLocaleString('ru-RU')} сум</p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'OK',
            });

            setSelectedProducts([]);
            setShowCartModal(false);

        } catch (error) {
            console.error('Error creating order:', error);

            Swal.fire({
                icon: 'error',
                title: t('orderCreate.notifications.error.title'),
                text: error.data?.message || t('orderCreate.notifications.error.default'),
                confirmButtonText: 'OK',
            });
        }
    };

    // Проверяем, выбран ли товар
    const isProductSelected = (product) => {
        const productId = product.product_id || product.id;
        return selectedProducts.some(p => p.product_id === productId);
    };

    // Сброс на первую страницу при изменении поиска
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        const totalPages = pagination.totalPages;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);

            if (page <= 3) {
                endPage = Math.min(maxVisiblePages, totalPages);
            }

            if (page >= totalPages - 2) {
                startPage = Math.max(1, totalPages - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    // Компонент кнопки пагинации
    const PaginationButton = ({ children, onClick, disabled, active = false, className = '' }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${active
                    ? 'bg-mainColor text-white shadow-md'
                    : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                ${className}
            `}
        >
            {children}
        </button>
    );

    // Общая сумма заказа
    const totalOrderSum = useMemo(() => {
        return selectedProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchase_price || 0)), 0);
    }, [selectedProducts]);

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
            <div className=" mx-auto">
                {/* Заголовок */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">
                        {t('orderCreate.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('orderCreate.subtitle')}
                    </p>
                </div>

                {/* Поиск */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-text-light dark:text-text-dark">
                                {t('orderCreate.search.title')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('orderCreate.search.subtitle')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowManualAdd(!showManualAdd)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-mainColor hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm md:text-base font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            {t('orderCreate.search.addManual')}
                        </button>
                    </div>

                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('orderCreate.search.placeholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                        />
                    </div>
                </div>

                {/* Форма добавления вручную */}
                {showManualAdd && (
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
                                onClick={() => setShowManualAdd(false)}
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
                                <input
                                    type="text"
                                    name="notes"
                                    value={manualProduct.notes}
                                    onChange={handleManualProductChange}
                                    className="w-full px-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark"
                                    placeholder={t('orderCreate.manualAdd.notesPlaceholder')}
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
                                    onClick={() => setShowManualAdd(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-lg font-medium transition-colors"
                                >
                                    {t('orderCreate.manualAdd.cancelButton')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Результаты поиска */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-text-light dark:text-text-dark">
                                {t('orderCreate.productList.title')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('orderCreate.search.found')}: <span className="font-medium text-mainColor">
                                    {pagination.totalCount.toLocaleString('ru-RU')}
                                </span>
                            </p>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('orderCreate.search.showing', {
                                count: products.length,
                                total: pagination.totalCount
                            })}
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 rounded-full mb-4">
                                <Package className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                                {searchTerm ? t('orderCreate.search.noResults.withSearch') : t('orderCreate.search.noResults.withoutSearch')}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                {searchTerm
                                    ? t('orderCreate.search.noResults.hintSearch')
                                    : t('orderCreate.search.noResults.hintNoSearch')
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Список товаров */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                                {products.map((product) => {
                                    const isSelected = isProductSelected(product);
                                    const productName = product.product?.name || product.name;

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleProductSelect(product)}
                                            className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-mainColor dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-900/50 shadow-lg'
                                                : 'bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-700 hover:border-mainColor dark:hover:border-blue-600 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-mainColor border-mainColor scale-110'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {isSelected && (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                {(product.unit || product.product?.unit) && (
                                                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 font-medium">
                                                        <Box className="w-3 h-3" />
                                                        {product.unit || product.product?.unit}
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="font-medium text-text-light dark:text-text-dark mb-2 line-clamp-2 min-h-[2.5rem]">
                                                {productName}
                                            </h4>

                                            {product.product?.category?.name && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                                                    <Package className="w-3 h-3 flex-shrink-0" />
                                                    <span>{product.product.category.name}</span>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                {product.purchase_price && (
                                                    <div className="flex items-center gap-1.5 text-sm text-mainColor dark:text-blue-400 font-semibold">
                                                        <DollarSign className="w-4 h-4" />
                                                        {parseInt(product.purchase_price).toLocaleString('ru-RU')} сум
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                    <Building2 className="w-3 h-3" />
                                                    {product?.product?.location?.name}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 animate-bounce-slow">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-mainColor to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <ShoppingCart className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Пагинация */}
                            {pagination.totalPages > 1 && (
                                <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        {t('orderCreate.pagination.page')} {pagination.currentPage} {t('orderCreate.pagination.of')} {pagination.totalPages}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <PaginationButton
                                            onClick={() => handlePageChange(1)}
                                            disabled={pagination.currentPage === 1}
                                            title={t('orderCreate.pagination.firstPage')}
                                        >
                                            <ChevronsLeft className="w-4 h-4" />
                                        </PaginationButton>

                                        <PaginationButton
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            title={t('orderCreate.pagination.previousPage')}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </PaginationButton>

                                        {getPageNumbers().map(pageNum => (
                                            <PaginationButton
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                active={pagination.currentPage === pageNum}
                                            >
                                                {pageNum}
                                            </PaginationButton>
                                        ))}

                                        <PaginationButton
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            title={t('orderCreate.pagination.nextPage')}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </PaginationButton>

                                        <PaginationButton
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            title={t('orderCreate.pagination.lastPage')}
                                        >
                                            <ChevronsRight className="w-4 h-4" />
                                        </PaginationButton>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderCreate.pagination.goTo')}:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={pagination.totalPages}
                                            value={page}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 1 && value <= pagination.totalPages) {
                                                    handlePageChange(value);
                                                }
                                            }}
                                            className="w-20 px-3 py-1.5 text-sm bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor text-text-light dark:text-text-dark text-center"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderCreate.pagination.of')} {pagination.totalPages}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Плавающая кнопка корзины */}
            <button
                onClick={() => setShowCartModal(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 ${selectedProducts.length > 0
                    ? 'bg-gradient-to-br from-mainColor to-blue-600 hover:from-blue-700 hover:to-indigo-700 scale-100'
                    : 'bg-gray-400 dark:bg-gray-600 scale-90 opacity-50 cursor-not-allowed'
                    }`}
                disabled={selectedProducts.length === 0}
            >
                <div className="relative">
                    <ShoppingCart className="w-6 h-6 text-white" />
                    {selectedProducts.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                            {selectedProducts.length}
                        </div>
                    )}
                </div>
            </button>

            {/* Модальное окно корзины - Material Design Style */}
            {showCartModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2"
                    onClick={() => setShowCartModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-lg max-h-[85vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Заголовок */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-mainColor to-blue-600 text-white">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-6 h-6" />
                                <div>
                                    <h2 className="font-semibold text-lg">{t('orderCreate.cart.title')}</h2>
                                    <p className="text-xs text-white/80">
                                        {t('orderCreate.cart.itemCount', { count: selectedProducts.length })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCartModal(false)}
                                className="p-1 hover:bg-white/20 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Содержимое корзины */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3">
                            {selectedProducts.length === 0 ? (
                                <div className="text-center py-10">
                                    <Package className="w-12 h-12 text-mainColor dark:text-blue-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('orderCreate.cart.empty')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${product.isManual
                                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            {/* Информация о продукте */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-8 h-8 flex items-center justify-center rounded-md text-white ${product.isManual ? 'bg-amber-500' : 'bg-mainColor'
                                                    }`}>
                                                    {product.isManual ? <Edit2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</h4>
                                                    <div className="flex items-center gap-1 mt-1 flex-wrap text-xs">
                                                        {product.unit && (
                                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">{product.unit}</span>
                                                        )}
                                                        {product.isManual && (
                                                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                                                                {t('orderCreate.cart.manualLabel')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Количество и удаление */}
                                            <div className="flex items-center gap-2 ml-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={product.quantity}
                                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                    className="w-16 px-2 py-1 text-sm text-center border rounded-md dark:bg-gray-800 dark:border-gray-600"
                                                />
                                                <button
                                                    onClick={() => handleRemoveProduct(product.id)}
                                                    className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                                                    title={t('orderCreate.cart.remove')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Футер с суммой и кнопками */}
                        {selectedProducts.length > 0 && (
                            <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
                                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <span>{t('orderCreate.cart.totalItems')}:</span>
                                    <span>{selectedProducts.length}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
                                    <span>{t('orderCreate.cart.totalSum')}:</span>
                                    <span>{totalOrderSum.toLocaleString('ru-RU')} сум</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => setSelectedProducts([])}
                                        className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all text-gray-800 dark:text-gray-200"
                                    >
                                        {t('orderCreate.cart.clearButton')}
                                    </button>
                                    <button
                                        onClick={handleCreateOrder}
                                        disabled={isCreatingOrder}
                                        className="flex-1 py-2 bg-mainColor hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingOrder ? t('orderCreate.cart.creatingOrder') : t('orderCreate.cart.createOrderButton')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalOverlay {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes modalContent {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes slideInItem {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }

                .animate-modalOverlay {
                    animation: modalOverlay 0.3s ease-out;
                }

                .animate-modalContent {
                    animation: modalContent 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-slideInItem {
                    animation: slideInItem 0.4s ease-out;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite;
                }

                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
            `}</style>
        </div>
    );
}