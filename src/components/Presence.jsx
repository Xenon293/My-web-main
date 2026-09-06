import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const sessionKey = 'haniel-presence-id';
const getSessionId = () => { let id = localStorage.getItem(sessionKey); if (!id) { id = crypto.randomUUID(); localStorage.setItem(sessionKey, id); } return id; };

export function Presence() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;
    const id = getSessionId();
    const updatePresence = async () => { await supabase.from('presence').upsert({ id, last_seen: new Date().toISOString() }); const cutoff = new Date(Date.now() - 90_000).toISOString(); const { count: active } = await supabase.from('presence').select('*', { count: 'exact', head: true }).gte('last_seen', cutoff); if (typeof active === 'number') setCount(active); };
    updatePresence(); const timer = window.setInterval(updatePresence, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className="presence-indicator" aria-label={count === null ? 'Visitor count loading' : `${count} ${count === 1 ? 'person' : 'people'} viewing now`}><span className="presence-eye" aria-hidden="true" />{count === null ? 'checking presence' : `${count} ${count === 1 ? 'person' : 'people'} viewing now`}</span>;
}
