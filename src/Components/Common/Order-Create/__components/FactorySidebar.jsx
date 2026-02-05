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

            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {factories.map((factory) => (
                    <button
                        key={factory.id}
                        onClick={() => onFactoryChange(factory.id)}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${selectedFactory === factory.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${selectedFactory === factory.id ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            <span className="font-medium text-sm truncate">{factory.name}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}