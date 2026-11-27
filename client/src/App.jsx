import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from './utils/constants.js';
import { homeFor } from './utils/app.js';
import { useAuth } from './context/AuthContext.jsx';
import { Guard } from './layouts/Shell.jsx';
import { Loading } from './components/Shared.jsx';
import { Splash } from './components/Splash.jsx';
import { Login } from './pages/auth/Login.jsx';

const Courses = lazy(() => import('./pages/admin/Courses.jsx').then((m) => ({ default: m.Courses })));
const AddCourse = lazy(() => import('./pages/admin/AddCourse.jsx').then((m) => ({ default: m.AddCourse })));
const CourseDetail = lazy(() => import('./pages/admin/Courses.jsx').then((m) => ({ default: m.CourseDetail })));
const Instructors = lazy(() => import('./pages/admin/Instructors.jsx').then((m) => ({ default: m.Instructors })));
const Lectures = lazy(() => import('./pages/admin/Lectures.jsx').then((m) => ({ default: m.Lectures })));
const MyLectures = lazy(() => import('./pages/instructor/MyLectures.jsx').then((m) => ({ default: m.MyLectures })));
const NotFound = lazy(() => import('./pages/NotFound.jsx').then((m) => ({ default: m.NotFound })));
const EditCourse = lazy(() => import('./pages/admin/EditCourse.jsx').then((m) => ({ default: m.EditCourse })));
const EditLecture = lazy(() => import('./pages/admin/EditLecture.jsx').then((m) => ({ default: m.EditLecture })));

class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="not-found" role="alert"><h1>ChronoMagix hit an unexpected error.</h1><p>Reload the page to continue.</p><button className="button primary" onClick={() => window.location.reload()}>Reload</button></main> : this.props.children; }
}

function RouterApp() {
  const { user } = useAuth();
  return <ErrorBoundary><Suspense fallback={<Loading/>}><Routes>
    <Route path={ROUTES.LOGIN} element={user ? <Navigate to={homeFor(user)} replace/> : <Login/>}/>
    <Route path="/" element={<Navigate to={user ? homeFor(user) : ROUTES.LOGIN} replace/>}/>
    <Route path={ROUTES.ADMIN_COURSES} element={<Guard roles={['admin']}><Courses/></Guard>}/>
    <Route path="/admin/courses/new" element={<Guard roles={['admin']}><AddCourse/></Guard>}/>
    <Route path="/admin/courses/:id/edit" element={<Guard roles={['admin']}><EditCourse/></Guard>}/>
    <Route path="/admin/courses/:id" element={<Guard roles={['admin']}><CourseDetail/></Guard>}/>
    <Route path={ROUTES.ADMIN_INSTRUCTORS} element={<Guard roles={['admin']}><Instructors/></Guard>}/>
    <Route path={ROUTES.ADMIN_LECTURES} element={<Guard roles={['admin']}><Lectures/></Guard>}/>
    <Route path="/admin/lectures/:id/edit" element={<Guard roles={['admin']}><EditLecture/></Guard>}/>
    <Route path={ROUTES.INSTRUCTOR_LECTURES} element={<Guard roles={['instructor']}><MyLectures/></Guard>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></Suspense></ErrorBoundary>;
}

function EntryGate() {
  const [showSplash, setShowSplash] = useState(() => localStorage.getItem('chronomagix_splash_seen') !== 'true');
  const dismiss = () => { localStorage.setItem('chronomagix_splash_seen', 'true'); setShowSplash(false); };
  useEffect(() => {
    if (!showSplash) return undefined;
    const timer = window.setTimeout(dismiss, 1800);
    return () => window.clearTimeout(timer);
  }, [showSplash]);
  return <AnimatePresence mode="wait">{showSplash ? <Splash key="splash" onComplete={dismiss}/> : <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}><RouterApp/></motion.div>}</AnimatePresence>;
}

export default function App() { return <BrowserRouter><EntryGate/></BrowserRouter>; }
