import axios from 'axios';

const client = axios.create({
    baseURL: 'https://localhost/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

function getAccessToken() {
    const token = localStorage.getItem('access');
    if (!token) {
        throw new Error('No access token found');
    }
    return token;
}

function getRefreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
        throw new Error('No refresh token found');
    }
    return refresh;
}

async function refreshAccessToken() {
    try {
        const response = await client.post('/auth/refresh/', {
            refresh: getRefreshToken(),
        });
        localStorage.setItem('access', response.data.access);
        return response.data.access;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * A request interceptor that adds the access token to the request headers.
 */
client.interceptors.request.use(
    async (config) => {
        const token = getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    }
);

/**
 * A response interceptor that refreshes the access token if it is expired.
 */
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const token = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return client(originalRequest);
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return Promise.reject(error);
    }
);

export default client;