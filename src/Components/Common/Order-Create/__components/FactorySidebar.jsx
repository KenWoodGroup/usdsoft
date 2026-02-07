import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FactorySidebar({ factories, selectedFactory, onFactoryChange, isLoading }) {
    const { t } = useTranslation();

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Filter className="w-5 h-5 text-mainColor" />
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                    {t('orderCreate.factories.filter')}
                </h3>
            </div>

            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {factories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('orderCreate.factories.noFactories')}
                        </p>
                    </div>
                ) : (
                    factories.map((factory) => (
                        <button
                            key={factory.id}
                            onClick={() => onFactoryChange(factory.id)}
                            disabled={isLoading}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${selectedFactory === factory.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedFactory === factory.id
                                            ? 'bg-blue-500'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                                <span className="font-medium text-sm truncate" title={factory.name}>
                                    {factory.name}
                                </span>
                            </div>

                            {/* Опционально: показываем количество товаров, если нужно */}
                            {factory.product_count > 0 && (
                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0">
                                    {factory.product_count}
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Кастомные стили для скроллбара */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                }
                
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
            `}</style>
        </div>
    );
}