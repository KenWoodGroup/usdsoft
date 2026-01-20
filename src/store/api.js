import axios from "axios";
import Cookies from "js-cookie";

/* ===============================
   CONFIG
================================ */
export const BASE_URL = "https://api.usderp.uz/crm";

export const $api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ===============================
   GLOBAL REFRESH STATE
================================ */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

// 🔴 Вынесли logout отдельно
const forceLogout = () => {
    ["token", "refresh_token", "us_nesw", "nesw"].forEach((key) => Cookies.remove(key));
    window.location.href = "/login";
};

/* ===============================
   REQUEST INTERCEPTOR
================================ */
$api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка авторизации и не пытались ретраить
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Если уже идёт refresh, ставим запрос в очередь
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve($api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = Cookies.get("refresh_token");
                const userId = Cookies.get("us_nesw");

                if (!refreshToken || !userId) throw new Error("Refresh token или userId отсутствует");

                // Запрос на обновление токена
                const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                    userId,
                });

                const { access_token, refresh_token } = data;

                Cookies.set("token", access_token);
                Cookies.set("refresh_token", refresh_token);

                // Обновляем Authorization заголовок для всех последующих запросов
                $api.defaults.headers.Authorization = `Bearer ${access_token}`;

                // Продолжаем все отложенные запросы
                processQueue(null, access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return $api(originalRequest);
            } catch (err) {
                // 🔴 Если обновление не удалось, делаем полный logout
                processQueue(err, null);
                forceLogout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default $api;
