import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CalendarDays, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Loading } from '../components/Shared.jsx';
import { homeFor } from '../utils/app.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading/>;
  if (!user) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace/>;
  return children;
}

export function Shell({ children, title, crumb, action }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  const location = useLocation();
  const toast = useToast();
  const asideRef = useRef(null);
  const closeRef = useRef(null);
  const menuTriggerRef = useRef(null);
  useDocumentTitle(title);
  const menuHidden = compact && !open;
  const links = user.role === 'admin'
    ? [['/admin/courses', 'Courses', BookOpen], ['/admin/lectures', 'Lectures', CalendarDays], ['/admin/instructors', 'Instructors', Users]]
    : [['/instructor/lectures', 'My lectures', CalendarDays]];

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const change = (event) => { setCompact(event.matches); if (!event.matches) setOpen(false); };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!compact || !open) return undefined;
    const returnFocus = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
      if (event.key !== 'Tab' || !asideRef.current) return;
      const items = [...asideRef.current.querySelectorAll('button:not(:disabled):not([tabindex="-1"]),a[href]:not([tabindex="-1"])')];
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      requestAnimationFrame(() => (menuTriggerRef.current || returnFocus)?.focus?.());
    };
  }, [compact, open]);

  return <div className="shell"><a className="skip" href="#main">Skip to content</a>
    <aside ref={asideRef} className={'sidebar '+(open?'sidebar--open':'')} aria-hidden={menuHidden}>
      <div className="brand"><img src="/logo-mark.svg" alt=""/><span>Chrono<em>Magix</em><small>TIME, SCHEDULED.</small></span>
        <button ref={closeRef} type="button" className="mobile-close" onClick={()=>setOpen(false)} aria-label="Close menu" tabIndex={menuHidden?-1:0}><X/></button>
      </div>
      <span className="nav-caption">YOUR WORKSPACE</span>
      <nav id="primary-navigation" aria-label="Main navigation">{links.map(([to,label,Icon])=><Link key={to} to={to} tabIndex={menuHidden?-1:0} onClick={()=>compact&&setOpen(false)} className={location.pathname===to?'active':''} aria-current={location.pathname===to?'page':undefined}><Icon size={18} aria-hidden="true"/>{label}</Link>)}</nav>
      <div className="side-bottom"><div className="avatar" aria-hidden="true">{user.name.split(' ').map((part)=>part[0]).join('').slice(0,2)}</div><div className="user-meta"><strong>{user.name}</strong><small>{user.role}</small></div><button type="button" className="icon-button" aria-label="Sign out" tabIndex={menuHidden?-1:0} onClick={()=>{logout();toast('Signed out. See you soon.')}}><LogOut size={18}/></button></div>
    </aside>
    {open&&compact&&<button type="button" className="scrim" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
    <main className="workspace" id="main" aria-hidden={compact&&open}>
      <header className="pagehead"><button ref={menuTriggerRef} type="button" className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open menu" aria-controls="primary-navigation" aria-expanded={open}><Menu/></button><div><p className="breadcrumb">{crumb||'Workspace'}</p><h1 tabIndex="-1">{title}</h1></div>{action}</header>
      <div className="page-content"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}}>{children}</motion.div></AnimatePresence></div>
    </main>
  </div>;
}
