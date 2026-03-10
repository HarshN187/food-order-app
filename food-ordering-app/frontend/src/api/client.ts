import axios from 'axios';

// Note: Vite uses import.meta.env for environment variables
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pre-initialize token from localStorage if it exists
const initialToken = localStorage.getItem('token');
if (initialToken) {
  client.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

export default client;
