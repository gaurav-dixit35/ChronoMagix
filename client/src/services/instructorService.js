import api from './api.js';
export const instructorService={list:async()=>(await api.get('/instructors')).data.data,availability:async(date,signal)=>(await api.get('/instructors/availability',{params:{date},signal})).data.data,myLectures:async()=>(await api.get('/instructor/lectures')).data.data};
