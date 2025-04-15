import baseUrl from './config.js';

// 统一的 API 请求方法
const apiRequest = async (path, method = 'GET', body = null, navigate) => {
    const url = `${baseUrl}`; // 替换为你的后端 API 基础 URL

    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        const options = {
            method,
            headers,
            credentials: 'include' // 确保携带 Cookie
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${url}${path}`, options);

        console.log("response is "+response);
        if (response.status === 401) {
            console.log("deal 401,and nav is "+navigate);
            // 处理 401 错误，进行导航
            if (navigate) {
                navigate('/');
            }
            // 将错误信息返回给调用者
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