import { useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../../store/services/Order.api";
import {
    Card,
    CardBody,
    Typography,
    Chip,
    Spinner
} from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import Error from "../../Other/UI/Error";
import Loading from "../../Other/UI/Loadings/Loading";

export default function OrderDetail() {
    const { id } = useParams();
    const { t } = useTranslation();

    const { data, isLoading, error } = useGetOrderByIdQuery(id);

    if (isLoading) {
        return (
            <Loading />
        );
    }

    if (error) {
        return (
            <Error />
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            {/* Header */}
            <Card className="bg-card-light dark:bg-card-dark">
                <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Typography
                            variant="h5"
                            className="text-text-light dark:text-text-dark"
                        >
                            {t("order.title")}
                        </Typography>

                        <Typography
                            variant="small"
                            className="text-gray-600 dark:text-gray-400"
                        >
                            ID: {data.id}
                        </Typography>
                    </div>

                    <Chip
                        value={t(`order.status.${data.status}`)}
                        color={data.status === "new" ? "blue" : "green"}
                        variant="ghost"
                        className="w-fit"
                    />
                </CardBody>
            </Card>


            {/* Items */}
            <Card className="bg-card-light dark:bg-card-dark">
                <CardBody className="space-y-4">
                    <Typography
                        variant="h6"
                        className="text-text-light dark:text-text-dark"
                    >
                        {t("order.items")}
                    </Typography>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.offer_items.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center py-3"
                            >
                                <div>
                                    <Typography className="text-text-light dark:text-text-dark">
                                        {index + 1}. {item.product_name}
                                    </Typography>
                                </div>

                                <Typography className="font-medium text-mainColor">
                                    {item.quantity}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <Typography
                variant="small"
                className="text-gray-600 dark:text-gray-400"
            >
                {label}
            </Typography>
            <Typography className="text-text-light dark:text-text-dark break-all">
                {value}
            </Typography>
        </div>
    );
}
