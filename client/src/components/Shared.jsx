import { useEffect, useState } from 'react';
import { cloneElement } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateKey, todayKey } from '../utils/date.js';
import { addDate } from '../utils/app.js';

export function Loading(){return <div className="loading"><span className="spinner"/> Loading your schedule</div>}

export function Field({label,value,change,type='text',required,children,registration,error,id,name,...props}){const fieldId=id||name||`field-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,errorId=`${fieldId}-error`,controlProps={id:fieldId,required, 'aria-invalid':error?'true':undefined,'aria-describedby':error?errorId:undefined,...registration,...props};const control=children?cloneElement(children,{id:fieldId,required,...(error?{'aria-invalid':'true','aria-describedby':errorId}:{}),...props}):<input type={type} {...controlProps} {...(change?{value,onChange:e=>change(e.target.value)}:{})}/>;return <div className="field"><label htmlFor={fieldId}>{label}{required&&<small> · Required</small>}</label>{control}{error&&<p id={errorId} className="inline-error field-error" role="alert">{error}</p>}</div>}

export function Error({children}){return children?<p className="inline-error" role="alert">{children}</p>:null}

export function CardSkeleton(){return <div className="course-grid">{[1,2,3].map(x=><div className="skeleton-card" key={x}><div/><i/><i/></div>)}</div>}

export function TableSkeleton({rows=5,columns=4}){return <div className="table-skeleton" aria-label="Loading list" role="status"><span className="sr-only">Loading list</span>{Array.from({length:rows},(_,row)=><div className="table-skeleton-row" style={{gridTemplateColumns:`repeat(${columns},minmax(48px,1fr))`}} key={row}>{Array.from({length:columns},(_,column)=><i key={column}/>)}</div>)}</div>}

export function ScheduleSkeleton(){return <div className="schedule-skeleton" role="status" aria-label="Loading schedule"><span className="sr-only">Loading schedule</span><i/><i/><i/></div>}

export function Empty({title,action}){return <div className="empty"><div className="dial-empty"><Clock3/></div><h2>{title}</h2>{action}</div>}

export function LectureTable({rows,onDelete,allInstructors=[]}){return <div className="table-wrap"><table><thead><tr><th scope="col">DATE</th><th scope="col">BATCH</th><th scope="col">INSTRUCTOR</th><th scope="col">COURSE</th><th scope="col">Actions</th></tr></thead><tbody>{rows.map(l=><tr key={l._id}><td><span className="date-dial">{l.date.slice(-2)}<small>{formatDateKey(l.date,{month:'short'})}</small></span>{formatDateKey(l.date)}</td><td>{l.title}</td><td>{l.instructor?.name||allInstructors.find(i=>i.id===l.instructor)?.name||'Instructor'}</td><td>{l.course?.name||''}</td><td><Link className="text-link" to={`/admin/lectures/${l._id}/edit`}>Edit</Link> <button className="icon-button danger" aria-label={`Delete lecture ${l.title||''}`} onClick={()=>onDelete(l)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>}

export function WeekGrid({rows}){const[start,setStart]=useState(()=>{const now=todayKey();const d=new Date(`${now}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-d.getUTCDay());return d.toISOString().slice(0,10)});const days=Array.from({length:7},(_,i)=>{const d=new Date(`${start}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)});return <div className="week"><div className="week-controls"><button className="icon-button" onClick={()=>setStart(addDate(start,-7))}><ChevronLeft/></button><span>{formatDateKey(days[0])} — {formatDateKey(days[6])}</span><button className="icon-button" onClick={()=>setStart(addDate(start,7))}><ChevronRight/></button></div><div className="week-grid">{days.map(d=><section key={d}><span className="eyebrow">{formatDateKey(d,{weekday:'short'})}</span><strong>{d.slice(-2)}</strong>{rows.filter(x=>x.date===d).map(l=><article key={l._id}>{l.course?.name}<small>{l.instructor?.name}</small></article>)}</section>)}</div></div>}

export function LectureGroup({title,rows}){return <section className="panel table-panel"><h2>{title}</h2>{rows.length?<div className="instructor-cards">{rows.map(l=><article key={l._id}><span className="date-dial">{l.date.slice(-2)}<small>{formatDateKey(l.date,{month:'short'})}</small></span><div><h3>{l.course.name}</h3><p>{formatDateKey(l.date)} · {l.course.level}</p></div></article>)}</div>:<p className="muted">No lectures in this section.</p>}</section>}
