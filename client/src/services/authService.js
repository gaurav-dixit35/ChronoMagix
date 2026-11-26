import api from './api.js';
export const authService={login:async(credentials)=>(await api.post('/auth/login',credentials)).data.data,me:async()=>(await api.get('/auth/me')).data.data};
