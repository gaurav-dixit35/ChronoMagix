import { useEffect, useState } from 'react';
import { instructorService } from '../../services/instructorService.js';
import { Error, Empty, LectureGroup, ScheduleSkeleton } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { formatDateKey, todayKey } from '../../utils/date.js';
import { errorText } from '../../utils/app.js';

export function MyLectures() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setRows(null);
    setError('');
    instructorService.myLectures(controller.signal).then(setRows).catch((e) => {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') setError(errorText(e));
    });
    return () => controller.abort();
  }, [retry]);

  const today = todayKey();
  const upcoming = rows?.filter((lecture) => lecture.date >= today) || [];
  const past = rows?.filter((lecture) => lecture.date < today) || [];
  return <Shell title="My lectures" crumb="INSTRUCTOR / MY SCHEDULE">
    {error&&<Error>{error}</Error>}
    {rows===null?<ScheduleSkeleton/>:rows.length===0?<Empty title={error?'Could not load your schedule. Please retry.':'No lectures assigned yet. Your schedule will appear here.'} action={error&&<button className="button secondary" onClick={()=>setRetry((value)=>value+1)}>Retry</button>}/>:<>
      <section className="next-up"><span className="eyebrow">NEXT UP</span><h2>{upcoming[0]?.course?.name||'Your schedule'}</h2><p>{upcoming[0]?formatDateKey(upcoming[0].date):'No upcoming lectures'}{upcoming[0]?' · '+upcoming[0].course.level:''}</p></section>
      <LectureGroup title="Upcoming" rows={upcoming}/><LectureGroup title="Past lectures" rows={past}/>
    </>}
  </Shell>;
}
