import baseUrl from './config.js';

// 统一的 API 请求方法
const apiRequest = async (path, method = 'GET', body = null, navigate) => {
    const url = `http://${baseUrl}`;
    let fullUrl = `${url}${path}`;

    try {
        const headers = {}; // 初始化空headers

        // 只对非FormData的请求设置Content-Type为application/json
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const options = {
            method,
            headers,
            credentials: 'include' // 确保携带 Cookie
        };

        if (method === 'GET' && body) {
            const queryParams = new URLSearchParams();
            for (const key in body) {
                queryParams.append(key, body[key]);
            }
            fullUrl += `?${queryParams.toString()}`;
        } else if (body) {
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(fullUrl, options);

        console.log("response is " + response);
        if (response.status === 401) {
            console.log("deal 401,and nav is " + navigate);
            if (navigate) {
                navigate('/');
            }
            throw new Error('请求被拒绝');
        }

        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('请求出错:', error);
        return null;
    }
};

export default apiRequest;