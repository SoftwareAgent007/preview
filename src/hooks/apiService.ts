type ApiService<T> = {
  getData: (endpoint: string) => Promise<T>;
  postData: (endpoint: string, body: any) => Promise<T>;
  deleteData: (endpoint: string) => Promise<T>;
  patchData: (endpoint: string, body: any) => Promise<T>;
  putData: (endpoint: string, body: any) => Promise<T>;
};

const API_CONTROL_URL = import.meta.env.VITE_API_ANALYTICS_URL || '';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWQ3NDFlZi1kNzc3LTQyM2MtYTE0NS1lNjZjMjAzNjU4YTQiLCJlbWFpbCI6InJhYmNodWsuYWxla3NhbmRyQGdtaWFsLmNvbSIsImd1aWxkSWRzIjpbIjEzMDY3NDgyNzk5MDM2MjExNDIiXSwiaWF0IjoxNzQyNTU1MTkzLCJleHAiOjE3NDMxNTk5OTN9.TIsREcA5lBkB77zwtWee6ip1PcJ-RqwnY3-HC-xuPmM';

const requestInterceptor = (url: string, options: RequestInit) => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  const interceptedOptions = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  return { url, options: interceptedOptions };
};

const responseInterceptor = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.body;
};

const createApiService = <T>(baseUrl: string): ApiService<T> => {
  const getData = async (endpoint: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, { method: 'GET' });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const postData = async (endpoint: string, body: any): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    console.log("postData", body);
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, {
      method: 'POST',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const deleteData = async (endpoint: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, { method: 'DELETE' });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const patchData = async (endpoint: string, body: any): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, {
      method: 'PATCH',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const putData = async (endpoint: string, body: any): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  return { getData, postData, deleteData, patchData, putData };
};

export const apiService = createApiService<any>(API_CONTROL_URL);
