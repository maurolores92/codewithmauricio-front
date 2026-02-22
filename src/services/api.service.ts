import axios from 'axios';

// import { api } from '../environments';
let host = 'https://api-fema.codeah.com.ar/api'; //prod
if(process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  host = 'http://localhost:5002/api'
}

const api = {
  host,
}
const repository = axios.create({
  baseURL: api.host,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '12345',
  },
});
repository.interceptors.request.use(
  function (config) {
    // Obtener el token actual de localStorage antes de cada petición
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('[API Request] Token added to headers', {
          path: config.url,
          hasToken: !!token
        });
      }
    }
    
    return config;
  },
  function (error) {
    console.error(error);

return Promise.reject(error);
  }
);

repository.interceptors.response.use(
  function (response) {

    if (response.data.status === 403 || response.data.status === 401) {
      // authService.logout();
      console.error('Error al iniciar sesion');
      throw new Error('Error al iniciar sesion');
    }

    return response;
  },
  function (error) {
    if (error.response?.status === 401 || error.response?.status === 403 || (error.response?.data && error.response.data?.message === 'Unauthenticated')) {
      // store.dispatch('logout', { router, doRedirect: true });
      console.error('Error al iniciar sesion');
      throw Error('Error al iniciar sesion');
    }
    throw error;
  }
);
const getHeaders = () => {
  const headers: any = {};
  const token = localStorage.getItem("accessToken");
  if(token) {
      const tokenHeader = token ? `Bearer ${token}` : null;
      headers['Authorization'] = tokenHeader;
  }

  return headers;
}

const apiConnector = {
    get: async <T>(path: string, params = {}) => await repository.get<T>(path, { params }).then(({data})=>data),
    post: async (path: string, body: any) => await repository.post(path, body).then(({data})=>data),
    put: async (path: string, body: any) => await repository.put(path, body).then(({data})=>data),
    remove: async (path: string, params = {}) => await  repository.delete(path, { params }).then(({data})=>data),
    sendFile: async (path: string, body: any) => {
      const headers = { "Content-Type": "multipart/form-data", ...getHeaders()};

      return await repository
        .post(path, body, {
          headers,
        }).then(({data})=>data);
    },
    downloadFile: async (path: string, fileName: any, params = {}) => {
      const headers = { 'Content-Type': 'blob', ...getHeaders()};

      const response = await repository
        .get(path, {
          responseType: 'blob',
          params,
          headers,
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    },
  };

export default apiConnector;
