import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { courseService } from '../../services/courseService.js';
import { Field, Error } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { courseFormSchema } from '../../schemas/forms.js';
import { errorText } from '../../utils/app.js';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function AddCourse() {
  const toast = useToast();
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(courseFormSchema), mode: 'onBlur', shouldFocusError: true,
    defaultValues: { name: '', level: 'Beginner', description: '' },
  });
  const form = watch();
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
    if (!allowedImageTypes.includes(selected.type)) return setError('image', { type: 'validate', message: 'Choose a JPEG, PNG or WebP image.' });
    if (selected.size > 2 * 1024 * 1024) return setError('image', { type: 'validate', message: 'Choose an image smaller than 2 MB.' });
    setFile(selected);
  }

  async function submit(values) {
    if (errors.image?.type === 'validate') return;
    if (!file) { setError('image', { type: 'required', message: 'Choose a course image to continue.' }, { shouldFocus: true }); return; }
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.append(key, value));
    data.append('image', file);
    try {
      const course = await courseService.create(data);
      toast('Course created. You can add its first lecture now.');
      nav(`/admin/courses/${course._id}`);
    } catch (error) {
      const message = errorText(error);
      setError('root.server', { message });
      toast(message, 'error');
    }
  }

  return <Shell title="Add a course" crumb="COURSES / NEW"><Link className="back-link" to="/admin/courses"><ArrowLeft size={16}/> Back to courses</Link><div className="form-layout">
    <form className="panel form-panel" noValidate onSubmit={handleSubmit(submit)}>
      <Field label="Course name" name="name" registration={register('name')} required error={errors.name?.message}/>
      <Field label="Level" name="level" registration={register('level')} required error={errors.level?.message}><select {...register('level')}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></Field>
      <Field label="Description" name="description" registration={register('description')} required error={errors.description?.message}><textarea rows="5" maxLength="1000" {...register('description')}/></Field>
      <small className="counter">{(form.description || '').length} / 1000</small>
      <Field label="Course image · JPEG, PNG or WebP · up to 2 MB" name="image" required error={errors.image?.message}><input type="file" accept="image/jpeg,image/png,image/webp" {...register('image')} onChange={chooseImage}/></Field>
      {preview&&<img className="upload-preview" src={preview} alt="Selected course preview"/>}
      <Error>{errors.root?.server?.message}</Error><button className="button primary" disabled={isSubmitting}>{isSubmitting?<><span className="spinner" aria-hidden="true"/> Saving course…</>:'Save course'}</button>
    </form>
    <aside className="preview panel"><span className="eyebrow">CARD PREVIEW</span>{preview?<img src={preview} alt="Course preview"/>:<div className="preview-art"><img src="/logo-mark.svg" alt=""/></div>}<span className="level">{form.level}</span><h2>{form.name||'Your course title'}</h2><p>{form.description||'A short description will appear here.'}</p></aside>
  </div></Shell>;
}
