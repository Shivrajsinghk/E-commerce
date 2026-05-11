import axios from "axios";
import store from "../features/store";
import { logout } from "../features/authSlice";

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;

export const setToken = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
}

export const removeToken = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export const getAccessToken = () => {
    return localStorage.getItem('access_token');
}

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
}

const decodeJwtPayload = (token) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = window.atob(base64);
        return JSON.parse(payload);
    }
    catch {
        return null;
    }
};

export const isTokenExpired = (token) => {
    if (!token) {
        return true;
    }

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) {
        return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
};

export const refreshAccessToken = async () => {
    const refresh = getRefreshToken();

    if (!refresh) {
        throw new Error("No refresh token available");
    }

    const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh
    });

    const newAccess = res.data.access;
    setToken({
        access: newAccess,
        refresh
    });

    return newAccess;
};

const authFetch = axios.create({
    baseURL: BASE_URL
});

authFetch.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
});

authFetch.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const tokenCode = error.response?.data?.code;
    const shouldRefresh = (status === 401 || status === 403) && tokenCode === "token_not_valid";

    if (shouldRefresh && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refresh = getRefreshToken();

        if (!refresh) {
            removeToken();
            store.dispatch(logout());
            window.location.href = "/login";
            return Promise.reject(error);
        }

        try {
            const newAccess = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return authFetch(originalRequest);
        }
        catch (refreshError) {
            removeToken();
            store.dispatch(logout());
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
});

export default authFetch
