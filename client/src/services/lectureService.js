import api from './api.js';
export const lectureService={list:async(params)=>(await api.get('/lectures',{params})).data.data,create:async(courseId,data)=>(await api.post(`/courses/${courseId}/lectures`,data)).data.data,update:async(id,data)=>(await api.patch(`/lectures/${id}`,data)).data.data,remove:async(id)=>(await api.delete(`/lectures/${id}`)).data.data};
