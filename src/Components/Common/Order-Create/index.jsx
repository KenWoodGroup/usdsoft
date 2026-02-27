'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStockGetSearchQuery, useLazySearchFactoryByNameQuery } from '../../../store/services/stock.api';
import { useCreateOrderMutation } from '../../../store/services/Order.api';
import Loading from '../../Other/UI/Loadings/Loading';
import debounce from 'lodash/debounce';
import { SearchIcon, Package, ShoppingCart, Plus, X, Edit2, Send, Trash2, ChevronsLeft, ChevronsRight, Hash, DollarSign, Box, FileText, Building2, Factory, Filter, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import CartModal from './__components/CartModal';
import ManualProductForm from './__components/ManualProductForm';
import FactorySidebar from './__components/FactorySidebar';
import ProductGrid from './__components/ProductGrid';
import Pagination from './__components/Pagination';

export default function OrderCreate() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [factorySearchTerm, setFactorySearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showManualAdd, setShowManualAdd] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState('all');
    const [searchedFactories, setSearchedFactories] = useState([]);
    const [searchMode, setSearchMode] = useState('products'); // 'products' или 'factories'
    const [persistentLocations, setPersistentLocations] = useState([]);

    const searchInputRef = useRef(null);
    const factorySearchInputRef = useRef(null);
    const lastSearchRef = useRef('');

    // Lazy query для поиска завода по названию
    const [searchFactoryByName, { data: factorySearchData, isLoading: isSearchingFactory }] = useLazySearchFactoryByNameQuery();

    // Получаем данные с API
    // Пропускаем запрос если: нет активного поиска и не выбран конкретный завод
    const shouldSkip = !debouncedSearchTerm && selectedFactory === 'all';

    const { data, isLoading, error, isFetching } = useStockGetSearchQuery(
        {
            search: debouncedSearchTerm || '',
            page,
            location_id: selectedFactory !== 'all' ? selectedFactory : undefined,
        },
        {
            skip: shouldSkip,
            refetchOnMountOrArgChange: true,
        }
    );

    // Mutation для создания заказа
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

    // Дебаунс для поиска товаров
    const debouncedSearch = useCallback(
        debounce((value) => {
            setDebouncedSearchTerm(value);
            if (value !== lastSearchRef.current) {
                lastSearchRef.current = value;
                setPage(1);
            }
        }, 500),
        []
    );

    // Дебаунс для поиска заводов
    const debouncedFactorySearch = useCallback(
        debounce((value) => {
            if (value.trim()) {
                handleFactorySearch(value.trim());
            } else {
                setSearchedFactories([]);
            }
        }, 500),
        []
    );

    // Обработчик изменения поиска товаров
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Обработчик изменения поиска заводов
    const handleFactorySearchChange = (e) => {
        const value = e.target.value;
        setFactorySearchTerm(value);
        debouncedFactorySearch(value);
    };

    // Обработчик поиска завода
    const handleFactorySearch = async (factoryName) => {
        if (!factoryName) {
            setSearchedFactories([]);
            return Promise.resolve();
        }

        try {
            // Шаг 1: Поиск заводов по названию через API (возвращает массив)
            const result = await searchFactoryByName({
                factoryName,
                location_id: Cookies.get('location_id')
            }).unwrap();

            // result - это массив заводов: [{ id: "...", name: "..." }, ...]
            if (result && Array.isArray(result) && result.length > 0) {
                // Сохраняем все найденные заводы в список
                const factories = result.map(factory => ({
                    id: factory.id,
                    name: factory.name,
                    product_count: 0
                }));

                setSearchedFactories(factories);

                // Показываем уведомление о количестве найденных заводов
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${t('orderCreate.factories.found') || 'Найдено'}: ${result.length}`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            } else {
                setSearchedFactories([]);
                // Показываем уведомление, что заводы не найдены
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: t('orderCreate.factories.notFound') || 'Заводы не найдены',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error('Error searching factory:', error);
            setSearchedFactories([]);
            Swal.fire({
                icon: 'error',
                title: t('orderCreate.factories.searchError') || 'Ошибка поиска',
                text: error.data?.message || t('orderCreate.notifications.error.default'),
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    // Обработчик изменения фабрики - просто меняем выбранную фабрику
    const handleFactoryChange = (factoryId) => {
        setSelectedFactory(factoryId);
        setPage(1);

        // НЕ меняем поиск товаров - сохраняем то что пользователь ввел
        // Если поиска нет и выбрали конкретный завод - устанавливаем 'all'
        if (factoryId !== 'all' && !searchTerm) {
            setSearchTerm('all');
        }
        // Если переключились обратно на "Все заводы" и search='all' - очищаем
        if (factoryId === 'all' && searchTerm === 'all') {
            setSearchTerm('');
        }

        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Переключение режима поиска
    const toggleSearchMode = () => {
        setSearchMode(prev => prev === 'products' ? 'factories' : 'products');
        // Очищаем соответствующие поля при переключении
        if (searchMode === 'products') {
            // Переключаемся на поиск заводов
            setFactorySearchTerm('');
            setSearchedFactories([]);
            setTimeout(() => {
                if (factorySearchInputRef.current) {
                    factorySearchInputRef.current.focus();
                }
            }, 100);
        } else {
            // Переключаемся на поиск товаров
            setSearchTerm('');
            setPage(1);
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
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

    // Данные фабрик из locations API + найденные через поиск
    const factories = useMemo(() => {
        let locationsFromApi = persistentLocations;

        // Локальная фильтрация в сайдбаре при поиске заводов
        if (searchMode === 'factories' && factorySearchTerm.trim()) {
            const term = factorySearchTerm.toLowerCase();
            locationsFromApi = locationsFromApi.filter(loc =>
                loc.name.toLowerCase().includes(term)
            );
        }

        const allProducts = data?.data || [];

        // Подсчитываем количество товаров для каждой фабрики
        const factoryCounts = {};
        allProducts.forEach(product => {
            const locationId = product.product?.location?.id;
            if (locationId) {
                factoryCounts[locationId] = (factoryCounts[locationId] || 0) + 1;
            }
        });

        // Начинаем с "Все заводы"
        const factoryList = [
            {
                id: 'all',
                name: t('orderCreate.factories.all'),
                product_count: allProducts.length
            }
        ];

        // Добавляем заводы из API
        const apiFactories = locationsFromApi.map(location => ({
            id: location.id,
            name: location.name.trim(),
            product_count: factoryCounts[location.id] || 0
        }));

        // Создаем Map для быстрого поиска по ID
        const factoryMap = new Map();

        // Сначала добавляем все заводы из API
        apiFactories.forEach(factory => {
            factoryMap.set(factory.id, factory);
        });

        // Затем добавляем найденные заводы (если их еще нет)
        searchedFactories.forEach(searchedFactory => {
            if (!factoryMap.has(searchedFactory.id)) {
                factoryMap.set(searchedFactory.id, searchedFactory);
            }
        });

        // Преобразуем Map обратно в массив
        return [...factoryList, ...Array.from(factoryMap.values())];
    }, [persistentLocations, data?.data, t, searchedFactories]);

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
                isManual: false,
                factory_id: product.product?.location?.id || null,
                factory_name: product.product?.location?.name || ''
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

    // Очистка корзины
    const handleClearCart = () => {
        Swal.fire({
            title: t('orderCreate.notifications.clearCart.title'),
            text: t('orderCreate.notifications.clearCart.message'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('orderCreate.notifications.clearCart.confirm'),
            cancelButtonText: t('orderCreate.notifications.clearCart.cancel'),
        }).then((result) => {
            if (result.isConfirmed) {
                setSelectedProducts([]);
                Swal.fire({
                    icon: 'success',
                    title: t('orderCreate.notifications.clearCart.success'),
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    // Создание заказа
    const handleCreateOrder = async (cartData) => {
        const { date, is_logist, note, address } = cartData;

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

        // Проверяем обязательные поля из корзины
        if (!date || is_logist === null || !address) {
            Swal.fire({
                icon: 'error',
                title: t('orderCreate.notifications.missingFields.title'),
                text: t('orderCreate.notifications.missingFields.message'),
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            // Подготавливаем данные согласно вашему запросу
            const orderDataToSend = {
                location_id: Cookies?.get('location_id'),
                note: note || undefined,
                items: selectedProducts.map(product => ({
                    product_name: product.name,
                    product_price: Number(product.purchase_price) || 0,
                    unit: product.unit || 'dona',
                    quantity: Number(product.quantity) || 0
                })),
                date: date,
                is_logist: is_logist,
                address: address
            };

            // Убираем undefined поля
            Object.keys(orderDataToSend).forEach(key => {
                if (orderDataToSend[key] === undefined) {
                    delete orderDataToSend[key];
                }
            });

            // Показываем загрузку
            Swal.fire({
                title: t('orderCreate.notifications.creatingOrder.title'),
                text: t('orderCreate.notifications.creatingOrder.message'),
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Отправляем запрос
            const response = await createOrder(orderDataToSend).unwrap();

            // Успешное создание
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
                            <p class="text-slate-700 dark:text-slate-300 text-sm mt-1">${t('orderCreate.notifications.orderCreated.deliveryDate')}: ${new Date(date).toLocaleDateString('ru-RU')}</p>
                            <p class="text-slate-700 dark:text-slate-300 text-sm mt-1">${t('orderCreate.notifications.orderCreated.logistics')}: ${is_logist ? t('common.yes') : t('common.no')}</p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'OK',
            });

            // Очищаем данные
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

    // Автофокус на поле поиска при загрузке
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
                searchInputRef.current.setSelectionRange(
                    searchInputRef.current.value.length,
                    searchInputRef.current.value.length
                );
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Сброс на первую страницу при изменении поиска или фабрики
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, selectedFactory]);

    // Обновление постоянного списка локаций
    useEffect(() => {
        if (data?.locations && data.locations.length > 0) {
            setPersistentLocations(prev => {
                const locationMap = new Map(prev.map(l => [l.id, l]));
                data.locations.forEach(loc => {
                    locationMap.set(loc.id, loc);
                });
                return Array.from(locationMap.values());
            });
        }
    }, [data?.locations]);

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
            <div className="mx-auto">
                {/* Заголовок */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">
                        {t('orderCreate.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('orderCreate.subtitle')}
                    </p>
                </div>

                {/* Поиск и кнопка добавления вручную */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
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

                    {/* Переключатель режимов поиска */}
                    <div className="flex items-center gap-4 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg inline-flex">
                        <button
                            onClick={() => setSearchMode('products')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${searchMode === 'products'
                                ? 'bg-mainColor text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('orderCreate.search.mode.products') || 'Поиск товаров'}</span>
                        </button>
                        <button
                            onClick={() => setSearchMode('factories')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${searchMode === 'factories'
                                ? 'bg-mainColor text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Factory className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('orderCreate.search.mode.factories') || 'Поиск заводов'}</span>
                        </button>
                    </div>

                    {/* Поля поиска - показываем в зависимости от режима */}
                    <div className="grid grid-cols-1 gap-4">
                        {searchMode === 'factories' ? (
                            /* Поле поиска заводов */
                            <div className="relative">
                                <Factory className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    ref={factorySearchInputRef}
                                    type="text"
                                    placeholder={t('orderCreate.factories.searchPlaceholder') || 'Поиск завода...'}
                                    value={factorySearchTerm}
                                    onChange={handleFactorySearchChange}
                                    className="w-full pl-10 pr-12 py-3 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-text-light dark:text-text-dark transition-all duration-200"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {isSearchingFactory ? (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    ) : (
                                        factorySearchTerm && (
                                            <button
                                                onClick={() => {
                                                    setFactorySearchTerm('');
                                                    setSearchedFactories([]);
                                                    if (factorySearchInputRef.current) {
                                                        factorySearchInputRef.current.focus();
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Поле поиска товаров */
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={
                                        selectedFactory !== 'all'
                                            ? t('orderCreate.search.placeholderFiltered') || 'Поиск товаров на выбранном заводе...'
                                            : t('orderCreate.search.placeholder')
                                    }
                                    value={searchTerm === 'all' ? '' : searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-12 py-3 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent text-text-light dark:text-text-dark transition-all duration-200"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {isFetching ? (
                                        <Loader2 className="w-5 h-5 text-mainColor animate-spin" />
                                    ) : (
                                        (searchTerm && searchTerm !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    if (selectedFactory !== 'all') {
                                                        // Если выбран завод - устанавливаем 'all' для показа всех товаров завода
                                                        setSearchTerm('all');
                                                    } else {
                                                        // Если "Все заводы" - очищаем полностью
                                                        setSearchTerm('');
                                                    }
                                                    if (searchInputRef.current) {
                                                        searchInputRef.current.focus();
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Подсказка о текущем режиме поиска */}
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {searchMode === 'products' ? (
                            <span>🔍 {t('orderCreate.search.hint.products') || 'Поиск товаров по названию'}</span>
                        ) : (
                            <span>🏭 {t('orderCreate.search.hint.factories') || 'Поиск заводов по названию'}</span>
                        )}
                    </div>
                </div>


                {/* Форма добавления вручную */}
                {showManualAdd && (
                    <ManualProductForm
                        onClose={() => setShowManualAdd(false)}
                        onAddManualProduct={(productData) => {
                            setSelectedProducts(prev => [...prev, productData]);
                            setShowManualAdd(false);
                        }}
                    />
                )}

                {/* Основной контент: Фабрики и товары */}
                <div className="flex flex-col lg:flex-row gap-2">
                    {/* Блок фильтрации по фабрикам (левая панель - 25%) */}
                    <div className="lg:w-[25%]">
                        <FactorySidebar
                            factories={factories}
                            selectedFactory={selectedFactory}
                            onFactoryChange={handleFactoryChange}
                            isLoading={isFetching || isSearchingFactory}
                        />
                    </div>

                    {/* Блок товаров (правая панель - 75%) */}
                    <div className="lg:w-[75%]">
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-lg md:text-xl font-semibold text-text-light dark:text-text-dark">
                                        {selectedFactory === 'all'
                                            ? t('orderCreate.productList.titleAll')
                                            : t('orderCreate.productList.titleFactory', {
                                                factory: factories.find(f => f.id === selectedFactory)?.name || ''
                                            })
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {t('orderCreate.search.found')}: <span className="font-medium text-mainColor">
                                            {pagination.totalCount.toLocaleString('ru-RU')}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                                </div>
                            ) : products.length === 0 ? (
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
                                    <ProductGrid
                                        products={products}
                                        selectedProducts={selectedProducts}
                                        onProductSelect={handleProductSelect}
                                        isProductSelected={isProductSelected}
                                    />

                                    {/* Пагинация */}
                                    {pagination.totalPages > 1 && (
                                        <Pagination
                                            pagination={pagination}
                                            currentPage={page}
                                            onPageChange={handlePageChange}
                                            getPageNumbers={() => {
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
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
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

            {/* Модальное окно корзины */}
            <CartModal
                isOpen={showCartModal}
                onClose={() => setShowCartModal(false)}
                selectedProducts={selectedProducts}
                onQuantityChange={handleQuantityChange}
                onRemoveProduct={handleRemoveProduct}
                onClearCart={handleClearCart}
                onCreateOrder={handleCreateOrder}
                isCreatingOrder={isCreatingOrder}
                totalOrderSum={selectedProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchase_price || 0)), 0)}
            />
        </div>
    );
}