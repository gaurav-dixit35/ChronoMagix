import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Field, Error } from '../../components/Shared.jsx';
import { loginFormSchema } from '../../schemas/forms.js';
import { homeFor, errorText } from '../../utils/app.js';

export function Login(){
  const { user, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginFormSchema), mode: 'onBlur', shouldFocusError: true });
  useEffect(() => { if (user) nav(homeFor(user), { replace: true }); }, [user, nav]);
  async function submit(credentials) {
    try { const signedIn = await login(credentials); nav(homeFor(signedIn), { replace: true }); }
    catch (err) { const message = errorText(err); setError('root.server', { message }); toast(message, 'error'); }
  }
  return <main className="login"><section className="login-hero"><img src="/logo-hero.png" alt="ChronoMagix"/><div className="login-shade"/><img className="mark" src="/logo-mark.svg" alt=""/><p className="eyebrow">CHRONOMAGIX · LECTURE SCHEDULING</p><h1>Time,<br/><em>scheduled.</em></h1><p>A considered space for courses, instructors and the dates that bring them together.</p><span className="hero-caption">PRECISION IN EVERY PLATE</span></section><section className="login-form"><div className="login-card"><img className="login-mark" src="/logo-mark.svg" alt=""/><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your schedule</h2><p className="muted">Your next chapter begins here.</p><form noValidate onSubmit={handleSubmit(submit)}>
    <Field label="Email address" type="email" name="email" registration={register('email')} required error={errors.email?.message}/>
    <Field label="Password" type="password" name="password" registration={register('password')} required error={errors.password?.message}/>
    <Error>{errors.root?.server?.message}</Error><button className="button primary full" disabled={isSubmitting}>{isSubmitting?<span className="spinner" aria-label="Signing in"/>:'Sign in'}</button>
  </form>{import.meta.env.VITE_SHOW_DEMO_HINTS==='true'&&<div className="demo-hints"><button type="button" onClick={()=>{setValue('email','admin@chronomagix.com');setValue('password','Admin@123')}}>Fill admin details</button><button type="button" onClick={()=>{setValue('email','gaurav@chronomagix.com');setValue('password','Instructor@123')}}>Fill instructor details</button></div>}</div></section></main>;
}
