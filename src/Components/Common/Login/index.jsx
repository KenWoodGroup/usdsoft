import { useState, React } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { setAuth } from "../../../store/slices/auth.slice";
import { useLoginMutation } from "../../../store/services/auth.api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading, error }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login({ email, password }).unwrap();
            dispatch(setAuth({ token: data.token, role: data.role }));
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
            alert(err.data?.message || "Ошибка авторизации");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                    Вход в систему
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Введите email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 mb-1" htmlFor="password">
                            Пароль
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-50"
                    >
                        {isLoading ? (
                            <svg
                                className="animate-spin h-5 w-5 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                        ) : null}
                        {isLoading ? "Вход..." : "Войти"}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm mt-2 text-center">
                            {error.data?.message || "Что-то пошло не так"}
                        </p>
                    )}
                </form>

                {/* Extra Links */}
                <div className="text-center text-gray-500 text-sm mt-4">
                    Нет аккаунта?{" "}
                    <button
                        onClick={() => navigate("/register")}
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
}
