import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { courseService } from '../../services/courseService.js';
import { Field, Error, Loading } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { courseFormSchema } from '../../schemas/forms.js';
import { errorText } from '../../utils/app.js';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function EditCourse() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(courseFormSchema), mode: 'onBlur', shouldFocusError: true,
    defaultValues: { name: '', level: 'Beginner', description: '' },
  });
  const form = watch();

  useEffect(() => {
    let active = true;
    courseService.get(id).then((value) => {
      if (!active) return;
      setCourse(value);
      reset({ name: value.name, level: value.level, description: value.description });
    }).catch((error) => active && setError('root.server', { message: errorText(error) }));
    return () => { active = false; };
  }, [id, reset, setError]);

  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseImage(event) {
    const selected = event.target.files?.[0] || null;
    setValue('image', selected, { shouldDirty: true });
    setFile(null);
    clearErrors('image');
    if (!selected) return;
    if (!allowedTypes.includes(selected.type)) return setError('image', { type: 'validate', message: 'Choose a JPEG, PNG or WebP image.' }, { shouldFocus: true });
    if (selected.size > 2 * 1024 * 1024) return setError('image', { type: 'validate', message: 'Choose an image smaller than 2 MB.' }, { shouldFocus: true });
    setFile(selected);
  }

  async function submit(values) {
    if (errors.image?.type === 'validate') return;
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.append(key, value));
    if (file) data.append('image', file);
    try {
      await courseService.update(id, data);
      toast('Course changes saved.');
      nav(`/admin/courses/${id}`, { replace: true });
    } catch (error) {
      const message = errorText(error);
      setError('root.server', { message });
      toast(message, 'error');
    }
  }

  return <Shell title="Edit course" crumb="COURSES / EDIT"><Link className="back-link" to={`/admin/courses/${id}`}><ArrowLeft size={16}/> Back to course</Link>
    {errors.root?.server&&!course?<Error>{errors.root.server.message}</Error>:!course?<Loading/>:<div className="form-layout">
      <form className="panel form-panel" noValidate onSubmit={handleSubmit(submit)}>
        <Field label="Course name" name="name" registration={register('name')} required error={errors.name?.message}/>
        <Field label="Level" name="level" registration={register('level')} required error={errors.level?.message}><select {...register('level')}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></Field>
        <Field label="Description" name="description" registration={register('description')} required error={errors.description?.message}><textarea rows="5" maxLength="1000" {...register('description')}/></Field>
        <small className="counter">{(form.description || '').length} / 1000</small>
        <Field label="Replace course image · JPEG, PNG or WebP · up to 2 MB" name="image" error={errors.image?.message}><input type="file" accept="image/jpeg,image/png,image/webp" {...register('image')} onChange={chooseImage}/></Field>
        <Error>{errors.root?.server?.message}</Error>
        <div className="form-actions"><button type="button" className="button secondary" onClick={() => nav(`/admin/courses/${id}`)}>Cancel</button><button className="button primary" disabled={isSubmitting}>{isSubmitting?'Saving…':'Save changes'}</button></div>
      </form>
      <aside className="preview panel"><span className="eyebrow">CURRENT COURSE</span><img src={preview || course.image} alt="Course preview"/><span className="level">{form.level}</span><h2>{form.name || 'Course title'}</h2><p>{form.description}</p></aside>
    </div>}
  </Shell>;
}
