/** Mock API reading from /mock/*.json **/
export async function apiGet(path){
  const url = `/mock${path}.json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.json();
}


export async function apiPost(path, body){
  console.log('MOCK POST', path, body);
  await new Promise(r=> setTimeout(r, 300));
  if (path === '/students/bulk') return { ok: true, ids: body && body.ids ? body.ids : [] };
  if (path === '/payments/link') return { ok: true, link: `https://pay.mock/${Math.random().toString(36).slice(2,9)}` };
  if (path === '/classes/drag') return { ok: true };

  if (typeof path === 'string' && path.startsWith('/students/')) {
    return { ok: true, id: body && body.id ? body.id : Math.floor(Math.random() * 1000) };
  }

  // Default echo
  return { ok: true, id: Math.floor(Math.random() * 10000), ...(body && typeof body === 'object' ? body : {}) };
}

