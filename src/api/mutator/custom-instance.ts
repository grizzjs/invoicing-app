import axios, { type AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api",
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config).then((res) => res.data); // ← must be res.data
};
