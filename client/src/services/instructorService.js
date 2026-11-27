import api from './api.js';
export const instructorService={list:async(signal)=>(await api.get('/instructors',{signal})).data.data,availability:async(date,signal,excludeLectureId)=>(await api.get('/instructors/availability',{params:{date,excludeLectureId},signal})).data.data,myLectures:async(signal)=>(await api.get('/instructor/lectures',{signal})).data.data};
