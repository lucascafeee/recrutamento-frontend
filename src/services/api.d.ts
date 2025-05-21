import { AxiosInstance } from 'axios';

declare module './api' {
  const api: AxiosInstance;
  export default api;
}

declare const api: AxiosInstance;
export default api; 