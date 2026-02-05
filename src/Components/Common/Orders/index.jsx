'use client';

import { useState } from "react";
import { useGetOrdersQuery } from "../../../store/services/Order.api";
import Cookies from "js-cookie";
import {
    Card,
    Typography,
    Spinner,
    Alert,
    Button,
    IconButton,
} from "@material-tailwind/react";
import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    ShoppingBagIcon,
    DocumentArrowDownIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import Delete from "./__components/Delete";
import { NavLink } from "react-router-dom";
import Error from "../../Other/UI/Error";
import Loading from "../../Other/UI/Loadings/Loading";
import { useTranslation } from "react-i18next";

export default function Orders() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const locationId = Cookies.get("location_id");

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useGetOrdersQuery({ id: locationId, page });

    const orders = data?.data?.records || [];
    const pagination = data?.data?.pagination || {
        page: 1,
        limit: 20,
        total_pages: 1,
        total_count: 0,
        hasNext: false,
        hasPrev: false,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusInfo = (status) => {
        const statusConfig = {
            "new": {
                icon: <ClockIcon className="h-5 w-5 text-yellow-500" />,
                color: "text-yellow-500",
                bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                label: t('orders.status.new')
            },
            "processing": {
                icon: <ClockIcon className="h-5 w-5 text-blue-500" />,
                color: "text-blue-500",
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                label: t('orders.status.processing')
            },
            "confirmed": {
                icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                color: "text-green-500",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                label: t('orders.status.confirmed')
            },
            "shipped": {
                icon: <ShoppingBagIcon className="h-5 w-5 text-purple-500" />,
                color: "text-purple-500",
                bgColor: "bg-purple-50 dark:bg-purple-900/20",
                label: t('orders.status.shipped')
            },
            "delivered": {
                icon: <CheckCircleIcon className="h-5 w-5 text-emerald-500" />,
                color: "text-emerald-500",
                bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
                label: t('orders.status.delivered')
            },
            "cancelled": {
                icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
                color: "text-red-500",
                bgColor: "bg-red-50 dark:bg-red-900/20",
                label: t('orders.status.cancelled')
            },
            "completed": {
                icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                color: "text-green-500",
                bgColor: "bg-green-50 dark:bg-green-900/20",
                label: t('orders.status.completed')
            }
        };

        return statusConfig[status] || {
            icon: <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />,
            color: "text-gray-500",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
            label: status
        };
    };

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <Error />;
    }

    return (
        <div className="">
            <div className="mb-6">
                <Typography variant="h4" className="text-text-light dark:text-text-dark mb-2">
                    {t('orders.title')}
                </Typography>
                <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
                    {t('orders.subtitle', { count: pagination.total_count })}
                </Typography>
            </div>

            {orders.length === 0 ? (
                <Card className="p-8 text-center bg-card-light dark:bg-card-dark shadow-none border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <div className="flex flex-col items-center justify-center">
                        <div className="p-4 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                            <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <Typography variant="h6" className="text-text-light dark:text-text-dark mb-2">
                            {t('orders.noOrders.title')}
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400 max-w-md">
                            {t('orders.noOrders.description')}
                        </Typography>
                    </div>
                </Card>
            ) : (
                <>
                    <Card className="overflow-hidden bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <th className="p-4 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-text-light dark:text-text-dark uppercase text-xs tracking-wider"
                                            >
                                                {t('orders.table.number')}
                                            </Typography>
                                        </th>
                                        <th className="p-4 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-text-light dark:text-text-dark uppercase text-xs tracking-wider"
                                            >
                                                {t('orders.table.status')}
                                            </Typography>
                                        </th>
                                        <th className="p-4 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-text-light dark:text-text-dark uppercase text-xs tracking-wider"
                                            >
                                                {t('orders.table.created')}
                                            </Typography>
                                        </th>
                                        <th className="p-4 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-text-light dark:text-text-dark uppercase text-xs tracking-wider"
                                            >
                                                {t('orders.table.date')}
                                            </Typography>
                                        </th>
                                        <th className="p-4 text-left">
                                            <Typography
                                                variant="small"
                                                className="font-semibold text-text-light dark:text-text-dark uppercase text-xs tracking-wider"
                                            >
                                                {t('orders.table.actions')}
                                            </Typography>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => {
                                        const statusInfo = getStatusInfo(order.status);
                                        const itemCount = order.offer_items?.length || 0;

                                        return (
                                            <tr
                                                key={order.id}
                                                className={`border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30 ${index % 2 === 0
                                                    ? "bg-gray-50/30 dark:bg-gray-900/10"
                                                    : ""
                                                    }`}
                                            >
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <Typography
                                                            variant="small"
                                                            className="font-medium text-text-light dark:text-text-dark font-mono"
                                                        >
                                                            #{order.id.slice(0, 8)}
                                                        </Typography>
                                                        {order.contract_number && (
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs text-gray-500 dark:text-gray-400"
                                                            >
                                                                {t('orders.table.contractNumber')}: {order.contract_number}
                                                            </Typography>
                                                        )}
                                                        {itemCount > 0 && (
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                                                            >
                                                                <ShoppingBagIcon className="h-3 w-3" />
                                                                {itemCount} {t('orders.table.items')}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border border-gray-200 dark:border-gray-700`}>
                                                        {statusInfo.icon}
                                                        <Typography
                                                            variant="small"
                                                            className={`font-medium ${statusInfo.color}`}
                                                        >
                                                            {statusInfo.label}
                                                        </Typography>
                                                    </div>
                                                    {order.updatedAt && (
                                                        <Typography
                                                            variant="small"
                                                            className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                                        >
                                                            {t('orders.table.updated')}: {formatDate(order.updatedAt)}
                                                        </Typography>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <Typography
                                                            variant="small"
                                                            className="text-text-light dark:text-text-dark font-medium"
                                                        >
                                                            {formatDate(order.date)}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <Typography
                                                            variant="small"
                                                            className="text-text-light dark:text-text-dark font-medium"
                                                        >
                                                            {formatDate(order.createdAt)}
                                                        </Typography>
                                                        {order.note && (
                                                            <Typography
                                                                variant="small"
                                                                className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
                                                            >
                                                                {t('orders.table.notes')}: {order.note}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <NavLink to={`/order-detail-/${order?.id}`}>
                                                            <Button
                                                                size="sm"
                                                                variant="outlined"
                                                                className="flex items-center gap-2 border-mainColor text-mainColor hover:bg-mainColor/10 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500/10"
                                                                title={t('orders.actions.view')}
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </NavLink>
                                                        <Delete orderId={order?.id} refresh={refetch} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {pagination.total_pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Typography
                                    variant="small"
                                    className="text-text-light dark:text-text-dark"
                                >
                                    {t('orders.pagination.page', { page: pagination.page })}
                                </Typography>
                            </div>

                            <div className="flex items-center gap-2">
                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    title={t('orders.pagination.first')}
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    <ChevronLeftIcon className="h-4 w-4 -ml-2" />
                                </IconButton>

                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={!pagination.hasPrev}
                                    className="border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    title={t('orders.pagination.previous')}
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </IconButton>

                                <div className="flex items-center gap-1 mx-2">
                                    {(() => {
                                        const pages = [];
                                        const maxVisiblePages = 5;
                                        const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                                        const endPage = Math.min(pagination.total_pages, startPage + maxVisiblePages - 1);

                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(
                                                <Button
                                                    key={i}
                                                    variant={i === page ? "filled" : "outlined"}
                                                    size="sm"
                                                    onClick={() => setPage(i)}
                                                    className={`min-w-[40px] h-10 flex items-center justify-center ${i === page
                                                        ? "bg-mainColor text-white hover:bg-blue-700"
                                                        : "border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {i}
                                                </Button>
                                            );
                                        }

                                        if (endPage < pagination.total_pages) {
                                            pages.push(
                                                <span key="ellipsis" className="px-2 text-text-light dark:text-text-dark">
                                                    ...
                                                </span>
                                            );
                                            pages.push(
                                                <Button
                                                    key={pagination.total_pages}
                                                    variant="outlined"
                                                    size="sm"
                                                    onClick={() => setPage(pagination.total_pages)}
                                                    className="min-w-[40px] h-10 border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    {pagination.total_pages}
                                                </Button>
                                            );
                                        }

                                        return pages;
                                    })()}
                                </div>

                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={!pagination.hasNext}
                                    className="border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    title={t('orders.pagination.next')}
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </IconButton>

                                <IconButton
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => setPage(pagination.total_pages)}
                                    disabled={page === pagination.total_pages}
                                    className="border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    title={t('orders.pagination.last')}
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                    <ChevronRightIcon className="h-4 w-4 -ml-2" />
                                </IconButton>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max={pagination.total_pages}
                                        value={page}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value >= 1 && value <= pagination.total_pages) {
                                                setPage(value);
                                            }
                                        }}
                                        className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-mainColor"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        / {pagination.total_pages}
                                    </span>
                                </div>

                                <Typography
                                    variant="small"
                                    className="text-text-light dark:text-text-dark"
                                >
                                    {t('orders.pagination.showing', {
                                        shown: orders.length,
                                        total: pagination.total_count
                                    })}
                                </Typography>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}