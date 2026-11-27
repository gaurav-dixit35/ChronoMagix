import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, ChevronRight as Right, Plus, Search, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { courseService } from '../../services/courseService.js';
import { instructorService } from '../../services/instructorService.js';
import { lectureService } from '../../services/lectureService.js';
import { formatDateKey, todayKey } from '../../utils/date.js';
import { errorText, addDate } from '../../utils/app.js';
import { Field, Error, Loading, CardSkeleton, TableSkeleton, Empty, LectureTable, WeekGrid, LectureGroup } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { useConfirm } from '../../context/ConfirmContext.jsx';
import { LectureDrawer } from '../../components/LectureDrawer.jsx';

export function Courses(){
  const [data,setData]=useState(null),[query,setQuery]=useState(''),[level,setLevel]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{let active=true;setData(null);setError('');courseService.list({search:query||undefined,level:level||undefined}).then(value=>active&&setData(value)).catch(e=>{if(active){setData([]);setError(errorText(e))}});return()=>{active=false}},[query,level,retry]);
  return <Shell title="Courses" crumb="ADMINISTRATION / COURSES" action={<Link className="button primary" to="/admin/courses/new"><Plus size={17}/> Add course</Link>}>
    <div className="toolbar"><label className="search"><Search size={17} aria-hidden="true"/><input aria-label="Search courses" placeholder="Find a course…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter by level" value={level} onChange={e=>setLevel(e.target.value)}><option value="">All levels</option>{['Beginner','Intermediate','Advanced'].map(x=><option key={x}>{x}</option>)}</select></div>
    {error&&<Error>{error}</Error>}
    {data===null?<CardSkeleton/>:data.length===0?<Empty title={error?'Could not load courses. Please retry.':'No courses yet. Create your first course to start scheduling.'} action={error?<button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Retry</button>:<Link className="button primary" to="/admin/courses/new">Create course</Link>}/>:<div className="course-grid">{data.map(c=><Link className="course-card" to={'/admin/courses/'+c._id} key={c._id}><div className="course-image"><img src={c.image} alt={c.name}/><span className={'level level--'+c.level.toLowerCase()}>{c.level}</span></div><div className="course-info"><h2>{c.name}</h2><p>{c.description}</p><div><span><CalendarDays size={15}/> {c.lectureCount} lectures</span><span className="view-link">Open <ChevronRight size={15}/></span></div></div></Link>)}</div>}
  </Shell>;
}



export function CourseDetail(){
  const {id}=useParams();
  const [course,setCourse]=useState(null);
  const [error,setError]=useState('');
  const [drawer,setDrawer]=useState(false);
  const [retry,setRetry]=useState(0);
  const toast=useToast();
  const confirm=useConfirm();
  const nav=useNavigate();
  async function load(){try{setCourse(await courseService.get(id));setError('')}catch(e){setError(errorText(e))}}
  useEffect(()=>{let active=true;courseService.get(id).then(value=>{if(active){setCourse(value);setError('')}}).catch(e=>active&&setError(errorText(e)));return()=>{active=false}},[id,retry]);
  async function delLecture(lecture){
    const accepted=await confirm({title:'Delete this lecture?',message:'The instructor will be available on '+lecture.date+' again.',confirmLabel:'Delete lecture'});
    if(!accepted)return;
    const original=course;
    setCourse(current=>({...current,lectures:current.lectures.filter(item=>item._id!==lecture._id)}));
    try{await lectureService.remove(lecture._id);toast('Lecture deleted. The instructor is available on that date again.')}
    catch(e){setCourse(original);toast(errorText(e),'error')}
  }
  async function delCourse(){
    const accepted=await confirm({title:'Delete '+course.name+'?',message:'This also deletes '+course.lectures.length+' lectures and frees their instructor dates.',confirmLabel:'Delete course'});
    if(!accepted)return;
    try{await courseService.remove(id);toast('Course and its lectures deleted.');nav('/admin/courses')}
    catch(e){toast(errorText(e),'error')}
  }
  return <Shell title={course?.name||'Course detail'} crumb="COURSES / DETAIL" action={course&&<button className="button primary" onClick={()=>setDrawer(true)}><Plus size={17}/> Add lecture</button>}>
    <button className="back-link" onClick={()=>nav('/admin/courses')}><ArrowLeft size={16}/> All courses</button>
    {error&&<Error>{error}</Error>}
    {!course?(error?<Empty title="Could not load this course." action={<button className="button secondary" onClick={()=>setRetry(value=>value+1)}>Retry</button>}/>:<TableSkeleton rows={4}/>):<><section className="detail-hero panel"><img src={course.image} alt={course.name}/><div><span className={'level level--'+course.level.toLowerCase()}>{course.level}</span><h2>{course.name}</h2><p>{course.description}</p><span className="muted">{course.lectures.length} scheduled lectures</span></div><div className="detail-actions"><Link className="button secondary" to={'/admin/courses/'+id+'/edit'}>Edit course</Link><button className="button danger-outline" onClick={delCourse}><Trash2 size={16}/> Delete course</button></div></section>
    <section className="panel table-panel"><div className="section-heading"><div><span className="eyebrow">COURSE SCHEDULE</span><h2>Lectures</h2></div></div>{course.lectures.length?<LectureTable rows={course.lectures} onDelete={delLecture}/>:<Empty title="No lectures yet. Add the first batch to book an instructor." action={<button className="button primary" onClick={()=>setDrawer(true)}>Add lecture</button>}/>}</section></>}
    {drawer&&course&&<LectureDrawer course={course} close={()=>setDrawer(false)} saved={load}/>}
  </Shell>;
}




