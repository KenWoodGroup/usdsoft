import { CheckCircle, Box, DollarSign, Package, Building2, ShoppingCart } from 'lucide-react';

export default function ProductGrid({ products, selectedProducts, onProductSelect, isProductSelected }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {products.map((product) => {
                const isSelected = isProductSelected(product);
                const productName = product.product?.name || product.name;

                return (
                    <div
                        key={product.id}
                        onClick={() => onProductSelect(product)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-mainColor dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-900/50 shadow-lg'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-mainColor dark:hover:border-blue-600 hover:shadow-md'
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
                            <div className="absolute -top-2 -right-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-mainColor to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <ShoppingCart className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}