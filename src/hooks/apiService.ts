type ApiService<T> = {
  getData: (endpoint: string) => Promise<T>;
  postData: (endpoint: string, data: T) => Promise<T>;
};

const API_CONTROL_URL = import.meta.env.VITE_API_ANALYTICS_URL || '';

const requestInterceptor = (url: string, options: RequestInit) => {
  return { url, options };
};

const responseInterceptor = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.statusText}`);
  }
  return response.json();
};

const createApiService = <T>(baseUrl: string): ApiService<T> => {
  const getData = async (endpoint: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, { method: 'GET' });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const postData = async (endpoint: string, data: T): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  return { getData, postData };
};

export const apiService = createApiService<any>(API_CONTROL_URL);
