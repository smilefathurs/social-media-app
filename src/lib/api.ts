import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL belum dikonfigurasi di .env.local');
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
