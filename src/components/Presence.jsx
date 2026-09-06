import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const sessionKey = 'haniel-presence-id';
const getSessionId = () => { let id = localStorage.getItem(sessionKey); if (!id) { id = crypto.randomUUID(); localStorage.setItem(sessionKey, id); } return id; };

export function Presence() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!supabase) { setStatus('offline'); return undefined; }
    const id = getSessionId();
    const updatePresence = async () => { const { error: heartbeatError } = await supabase.from('presence').upsert({ id, last_seen: new Date().toISOString() }); if (heartbeatError) { setStatus('offline'); return; } const cutoff = new Date(Date.now() - 90_000).toISOString(); const { count: active, error: countError } = await supabase.from('presence').select('*', { count: 'exact', head: true }).gte('last_seen', cutoff); if (countError) { setStatus('offline'); return; } if (typeof active === 'number') { setCount(active); setStatus('ready'); } };
    updatePresence(); const timer = window.setInterval(updatePresence, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const label = status === 'offline' ? 'presence unavailable' : status === 'loading' ? 'checking presence' : `${count} ${count === 1 ? 'person' : 'people'} viewing now`;
  return <span className={`presence-indicator is-${status}`} aria-label={label}><span className="presence-eye" aria-hidden="true" />{label}</span>;
}
