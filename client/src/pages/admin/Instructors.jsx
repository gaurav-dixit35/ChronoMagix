import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { instructorService } from '../../services/instructorService.js';
import { Error, Empty, TableSkeleton } from '../../components/Shared.jsx';
import { Shell } from '../../layouts/Shell.jsx';
import { errorText } from '../../utils/app.js';

export function Instructors() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    instructorService.list(controller.signal).then(setData).catch((e) => {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') setError(errorText(e));
    });
    return () => controller.abort();
  }, [retry]);

  const rows = data?.filter((person) => (person.name+' '+person.email).toLowerCase().includes(search.toLowerCase())) || [];
  return <Shell title="Instructors" crumb="ADMINISTRATION / INSTRUCTORS">
    <label className="search"><Search size={17} aria-hidden="true"/><input aria-label="Search instructors" placeholder="Search instructors…" value={search} onChange={(e)=>setSearch(e.target.value)}/></label>
    {error&&<Error>{error}</Error>}
    <section className="panel table-panel">
      {data===null?<TableSkeleton rows={6} columns={4}/>:rows.length===0?<Empty title={error?'Could not load instructors. Please retry.':'No instructors match your search.'} action={error&&<button className="button secondary" onClick={()=>setRetry((value)=>value+1)}>Retry</button>}/>:<div className="table-wrap"><table><thead><tr><th scope="col">INSTRUCTOR</th><th scope="col">EMAIL</th><th scope="col">LECTURES</th><th scope="col">SCHEDULE</th></tr></thead><tbody>{rows.map((person)=><tr key={person.id}><td>{person.name}</td><td>{person.email}</td><td>{person.lectureCount}</td><td><Link className="text-link" to={'/admin/lectures?instructorId='+person.id}>View lectures <ChevronRight size={15}/></Link></td></tr>)}</tbody></table></div>}
    </section>
  </Shell>;
}
