import { Button, Typography } from "@material-tailwind/react";

export default function Page403() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <div className="text-center max-w-md">
                <Typography
                    variant="h1"
                    className="text-[120px] font-bold leading-none mb-4"
                >
                    403
                </Typography>

                <Typography variant="h4" className="mb-2">
                    Доступ запрещён
                </Typography>

                <Typography className="text-gray-400 mb-8">
                    У вас нет прав для просмотра этой страницы
                </Typography>

                <Button
                    variant="outlined"
                    color="white"
                    onClick={() => window.history.back()}
                    className="border-white text-white hover:bg-white hover:text-black transition"
                >
                    ← Назад
                </Button>
            </div>
        </div>
    );
}
