import api from './api.js';
export const courseService={list:async(params)=>(await api.get('/courses',{params})).data.data,get:async(id)=>(await api.get(`/courses/${id}`)).data.data,create:async(data)=>(await api.post('/courses',data)).data.data,update:async(id,data)=>(await api.put(`/courses/${id}`,data)).data.data,remove:async(id)=>(await api.delete(`/courses/${id}`)).data.data};
