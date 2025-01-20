import axios from "axios";

export const gpAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GLOBAL_PAYMENT_BASE_URL,
});

export const collectAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_COLLECT_DEV_CRM6_URL,
});

export const msAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MICROSOFT_ONLINE_URL,
});
