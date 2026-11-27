import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { courseService } from '../../services/courseService.js';
import { instructorService } from '../../services/instructorService.js';
import { lectureService } from '../../services/lectureService.js';
import { errorText } from '../../utils/app.js';
import { Error, Empty, LectureTable, Loading, TableSkeleton, WeekGrid } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';

export function Lectures() {
  const [rows, setRows] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [view, setView] = useState('Table');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const query = params.toString();
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    let active = true;
    courseService.list({}).then((data) => active && setCourses(data)).catch((e) => active && setError(errorText(e)));
    instructorService.list().then((data) => active && setInstructors(data)).catch((e) => active && setError(errorText(e)));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setRows(null);
    setError('');
    const search = new URLSearchParams(query);
    const filters = { instructorId: search.get('instructorId')||undefined, courseId: search.get('courseId')||undefined, from: search.get('from')||undefined, to: search.get('to')||undefined };
    lectureService.list(filters, controller.signal).then(setRows).catch((e) => {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') { setRows([]); setError(errorText(e)); }
    });
    return () => controller.abort();
  }, [query, retry]);

  function updateFilter(key, value) {
    setParams((current) => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); return next; });
  }

  async function deleteLecture(lecture) {
    const accepted = await confirm({ title: 'Delete this lecture?', message: 'The instructor will be available on '+lecture.date+' again.', confirmLabel: 'Delete lecture' });
    if (!accepted) return;
    const deleteQuery = query;
    const index = rows.findIndex((item) => item._id === lecture._id);
    setRows((current) => current.filter((item) => item._id !== lecture._id));
    try {
      await lectureService.remove(lecture._id);
      toast('Lecture deleted. The instructor is available on that date again.');
    } catch (e) {
      if (queryRef.current === deleteQuery) setRows((current) => {
        if (!current || current.some((item) => item._id === lecture._id)) return current;
        const restored = [...current];
        restored.splice(Math.min(index, restored.length), 0, lecture);
        return restored;
      });
      toast(errorText(e), 'error');
    }
  }

  return <Shell title="Lectures" crumb="ADMINISTRATION / LECTURES">
    <div className="filters">
      <label className="filter-field">Course<select aria-label="Filter by course" value={params.get('courseId')||''} onChange={(e)=>updateFilter('courseId',e.target.value)}><option value="">All courses</option>{courses.map((course)=><option value={course._id} key={course._id}>{course.name}</option>)}</select></label>
      <label className="filter-field">Instructor<select aria-label="Filter by instructor" value={params.get('instructorId')||''} onChange={(e)=>updateFilter('instructorId',e.target.value)}><option value="">All instructors</option>{instructors.map((person)=><option value={person.id} key={person.id}>{person.name}</option>)}</select></label>
      <label className="filter-field">From<input aria-label="Filter from date" type="date" value={params.get('from')||''} onChange={(e)=>updateFilter('from',e.target.value)}/></label>
      <label className="filter-field">To<input aria-label="Filter to date" type="date" value={params.get('to')||''} onChange={(e)=>updateFilter('to',e.target.value)}/></label>
      <div className="segmented" role="group" aria-label="Schedule view">{['Table','Week'].map((name)=><button type="button" aria-pressed={view===name} className={view===name?'selected':''} onClick={()=>setView(name)} key={name}>{name}</button>)}</div>
    </div>
    {error&&<Error>{error}</Error>}
    <div className="panel table-panel">{rows===null?<TableSkeleton rows={6} columns={5}/>:rows.length===0?<Empty title={error?'Could not load lectures. Please retry.':'No lectures match these filters.'} action={error&&<button className="button secondary" onClick={()=>setRetry((value)=>value+1)}>Retry</button>}/>:view==='Table'?<LectureTable rows={rows} allInstructors={instructors} onDelete={deleteLecture}/>:<WeekGrid rows={rows}/>}</div>
  </Shell>;
}
