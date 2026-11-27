import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { lectureService } from '../../services/lectureService.js';
import { instructorService } from '../../services/instructorService.js';
import { Field, Error, Loading } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { lectureFormSchema } from '../../schemas/forms.js';
import { errorText } from '../../utils/app.js';

export function EditLecture() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [lecture, setLecture] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { register, handleSubmit, reset, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(lectureFormSchema), mode: 'onBlur', shouldFocusError: true,
    defaultValues: { date: '', instructorId: '', title: '' },
  });
  const date = watch('date');
  const instructorId = watch('instructorId');

  useEffect(() => {
    let active = true;
    lectureService.get(id).then((value) => {
      if (!active) return;
      setLecture(value);
      reset({ date: value.date, instructorId: value.instructor._id, title: value.title || '' });
    }).catch((error) => active && setError('root.server', { message: errorText(error) }));
    return () => { active = false; };
  }, [id, reset, setError]);

  useEffect(() => {
    if (!date || !lecture) return undefined;
    const controller = new AbortController();
    setCheckingAvailability(true);
    setAvailability([]);
    clearErrors('root.availability');
    instructorService.availability(date, controller.signal, id).then(setAvailability).catch((error) => {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') setError('root.availability', { message: errorText(error) });
    }).finally(() => !controller.signal.aborted && setCheckingAvailability(false));
    return () => controller.abort();
  }, [date, id, lecture, clearErrors, setError]);

  async function submit(values) {
    try {
      await lectureService.update(id, { ...values, title: values.title.trim() || undefined });
      toast('Lecture changes saved.');
      nav('/admin/lectures', { replace: true });
    } catch (error) {
      const message = errorText(error);
      setError('root.server', { message });
      toast(message, 'error');
    }
  }

  const selectedInstructorAvailable = availability.some((person) => String(person.id) === instructorId && person.available);

  return <Shell title="Edit lecture" crumb="LECTURES / EDIT"><Link className="back-link" to="/admin/lectures"><ArrowLeft size={16}/> Back to lectures</Link>
    {errors.root?.server&&!lecture?<Error>{errors.root.server.message}</Error>:!lecture?<Loading/>:<form className="panel form-panel edit-lecture-form" noValidate onSubmit={handleSubmit(submit)}>
      <p className="eyebrow">{lecture.course.name}</p>
      <Field label="Lecture date" name="date" type="date" registration={register('date')} required error={errors.date?.message}/>
      <Field label="Instructor" name="instructorId" registration={register('instructorId')} required error={errors.instructorId?.message}><select {...register('instructorId')} disabled={checkingAvailability}>
        <option value="">{checkingAvailability?'Checking availability…':'Choose an instructor'}</option>
        {availability.map((person) => <option key={person.id} value={person.id} disabled={!person.available}>{person.name}{person.available?' · Available':` · Booked on ${date}`}</option>)}
      </select></Field>
      <Field label="Batch title" name="title" registration={register('title')} error={errors.title?.message}/>
      <p className="muted" aria-live="polite">The instructor’s availability is checked again when you save.</p>
      <Error>{errors.root?.availability?.message||errors.root?.server?.message}</Error>
      <div className="form-actions"><button type="button" className="button secondary" onClick={() => nav('/admin/lectures')}>Cancel</button><button className="button primary" disabled={isSubmitting||checkingAvailability||!selectedInstructorAvailable}>{isSubmitting?'Saving…':'Save changes'}</button></div>
    </form>}
  </Shell>;
}
