import {createContext,useCallback,useContext,useState} from 'react';
const ToastContext=createContext(()=>{});
export function ToastProvider({children}){const[items,setItems]=useState([]);const toast=useCallback((message,type='success')=>{const id=crypto.randomUUID();setItems(v=>[...v,{id,message,type}]);setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)),3600)},[]);return <ToastContext.Provider value={toast}>{children}<div className="toast-stack" aria-live="polite">{items.map(x=><div className={`toast toast--${x.type}`} key={x.id}>{x.message}</div>)}</div></ToastContext.Provider>}
export const useToast=()=>useContext(ToastContext);
