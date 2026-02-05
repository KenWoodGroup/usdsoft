import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pagination({ pagination, currentPage, onPageChange, getPageNumbers }) {
    const { t } = useTranslation();

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

    return (
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {t('orderCreate.pagination.page')} {currentPage} {t('orderCreate.pagination.of')} {pagination.totalPages}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                <PaginationButton
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title={t('orderCreate.pagination.firstPage')}
                >
                    <ChevronsLeft className="w-4 h-4" />
                </PaginationButton>

                <PaginationButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title={t('orderCreate.pagination.previousPage')}
                >
                    <ChevronLeft className="w-4 h-4" />
                </PaginationButton>

                {getPageNumbers().map(pageNum => (
                    <PaginationButton
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        active={currentPage === pageNum}
                    >
                        {pageNum}
                    </PaginationButton>
                ))}

                <PaginationButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    title={t('orderCreate.pagination.nextPage')}
                >
                    <ChevronRight className="w-4 h-4" />
                </PaginationButton>

                <PaginationButton
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
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
                    value={currentPage}
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= pagination.totalPages) {
                            onPageChange(value);
                        }
                    }}
                    className="w-20 px-3 py-1.5 text-sm bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor text-text-light dark:text-text-dark text-center"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('orderCreate.pagination.of')} {pagination.totalPages}</span>
            </div>
        </div>
    );
}