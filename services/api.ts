import axios from 'axios';

const api = axios.create({
  baseURL: 'http://72.60.242.216:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;
