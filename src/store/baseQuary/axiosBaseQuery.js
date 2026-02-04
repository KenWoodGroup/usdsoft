import $api, { publicApi } from "../api";

/**
 * Профессиональный axiosBaseQuery для RTK Query
 * @param {boolean} usePublicApi - если true, используем publicApi (login/refresh)
 */
export const axiosBaseQuery = ({ usePublicApi = false } = {}) =>
    async ({ url, method, data }) => {
        const api = usePublicApi ? publicApi : $api;

        try {
            const result = await api({ url, method, data });
            return { data: result.data };
        } catch (err) {
            return {
                error: {
                    status: err.response?.status || 500,
                    data: err.response?.data || err.message,
                },
            };
        }
    };
