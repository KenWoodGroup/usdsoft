import axios from "axios";
import Cookies from "js-cookie";

export const BASE_URL = "https://api.usderp.uz/broker";

/* ===============================
   ПУБЛИЧНЫЙ API (login, refresh)
================================ */
export const publicApi = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ===============================
   ЗАЩИЩЁННЫЙ API (с токеном + 401 interceptor)
================================ */
export const $api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

const forceLogout = () => {
    // ["token", "refresh_token", "us_nesw", "nesw"].forEach((key) => Cookies.remove(key));
    // window.location.href = "/login";
};

// 🔹 request interceptor — добавляем токен
$api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 🔹 response interceptor — авто-refresh
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

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
                const userId = Cookies.get("user_id");

                if (!refreshToken || !userId) throw new Error("Refresh token или userId отсутствует");

                // Используем publicApi, чтобы не зациклить interceptor
                const { data } = await publicApi.post("/auth/refresh", {
                    refreshToken,
                    userId,
                });

                const { access_token, refresh_token } = data;

                Cookies.set("access_token", access_token);
                Cookies.set("refresh_token", refresh_token);

                $api.defaults.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return $api(originalRequest);
            } catch (err) {
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
