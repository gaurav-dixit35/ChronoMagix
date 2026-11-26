import {createContext,useContext,useEffect,useState} from 'react';
import {authService} from '../services/authService.js';
import api from '../services/api.js';
const AuthContext=createContext(null);
export function AuthProvider({children}){const[user,setUser]=useState(null);const[token,setToken]=useState(localStorage.getItem('chronomagix_token'));const[loading,setLoading]=useState(true);
useEffect(()=>{let active=true;if(!token){setLoading(false);return;}authService.me().then(value=>active&&setUser(value)).catch(()=>{localStorage.removeItem('chronomagix_token');setToken(null);setUser(null);}).finally(()=>active&&setLoading(false));return()=>{active=false};},[]);
useEffect(()=>{const id=api.interceptors.response.use(v=>v,e=>{if(e.response?.status===401){localStorage.removeItem('chronomagix_token');setToken(null);setUser(null)}return Promise.reject(e)});return()=>api.interceptors.response.eject(id)},[]);
const login=async(credentials)=>{const result=await authService.login(credentials);localStorage.setItem('chronomagix_token',result.token);setToken(result.token);setUser(result.user);return result.user};const logout=()=>{localStorage.removeItem('chronomagix_token');setToken(null);setUser(null)};
return <AuthContext.Provider value={{user,token,loading,login,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
