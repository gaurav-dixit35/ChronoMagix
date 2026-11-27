import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { instructorService } from '../services/instructorService.js';
import { lectureService } from '../services/lectureService.js';
import { Field, Error } from './Shared.jsx';
import { lectureFormSchema } from '../schemas/forms.js';
import { errorText } from '../utils/app.js';
import { formatDateKey } from '../utils/date.js';

export function LectureDrawer({ course, close, saved }) {
  const toast = useToast();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  const [available, setAvailable] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(lectureFormSchema), mode: 'onBlur', shouldFocusError: true,
    defaultValues: { date: '', instructorId: '', title: '' },
  });
  const date = watch('date');

  useEffect(() => {
    previousFocus.current = document.activeElement;
    panelRef.current?.querySelector('input:not([type="hidden"]),select')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')];
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); previousFocus.current?.focus?.(); };
  }, [close]);

  useEffect(() => {
    if (!date) { setAvailable([]); return undefined; }
    const controller = new AbortController();
    setLoadingAvailability(true);
    setAvailable([]);
    clearErrors('root.availability');
    instructorService.availability(date, controller.signal).then(setAvailable).catch((error) => {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') setError('root.availability', { message: errorText(error) });
    }).finally(() => !controller.signal.aborted && setLoadingAvailability(false));
    return () => controller.abort();
  }, [date, clearErrors, setError]);

  async function submit(values) {
    try {
      await lectureService.create(course._id, { ...values, title: values.title.trim() || undefined });
      const instructor = available.find((person) => String(person.id) === values.instructorId);
      toast(`Lecture added. ${instructor?.name || 'Instructor'} is booked for ${formatDateKey(values.date)}.`);
      await saved();
      close();
    } catch (error) {
      const message = errorText(error);
      setError('root.server', { message });
      toast(message, 'error');
    }
  }

  const hasAvailableInstructors = available.some((person) => person.available);
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <aside ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-describedby="drawer-description">
      <header><div><span className="eyebrow">NEW BATCH · {course.name}</span><h2 id="drawer-title">Add lecture</h2><p id="drawer-description" className="sr-only">Choose a lecture date, then select an instructor available that day.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close lecture form"><X/></button></header>
      <form noValidate onSubmit={handleSubmit(submit)}>
        <Field label="Choose a date first" name="date" type="date" registration={register('date')} required error={errors.date?.message}/>
        <Field label="Instructor" name="instructorId" registration={register('instructorId')} required error={errors.instructorId?.message}>
          <select {...register('instructorId')} disabled={!date||loadingAvailability}>
            <option value="">{!date?'Select a date first':loadingAvailability?'Loading availability…':'Choose an available instructor'}</option>
            {available.map((person) => <option key={person.id} value={person.id} disabled={!person.available}>{person.name}{person.available?' · Available':` · Booked on ${date}`}</option>)}
          </select>
        </Field>
        {date&&!loadingAvailability&&!hasAvailableInstructors&&!errors.root?.availability&&<p className="inline-error" role="status">Everyone is booked on this date. Try another day.</p>}
        <Field label="Batch title · optional" name="title" registration={register('title')} error={errors.title?.message}/>
        <Error>{errors.root?.availability?.message||errors.root?.server?.message}</Error>
        <footer><button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button primary" disabled={isSubmitting||!hasAvailableInstructors||!watch('instructorId')}>{isSubmitting?'Adding lecture…':'Add lecture'}</button></footer>
      </form>
    </aside>
  </div>;
}
