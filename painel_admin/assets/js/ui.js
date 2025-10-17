/** UI helpers: cards, tables, toasts **/
export function qs(sel, ctx=document){ return ctx.querySelector(sel); }
export function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

export function el(tag, cls, html){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(html !== undefined) e.innerHTML = html;
  return e;
}

function ensureRoot(){
  if(window.toastRoot) return;
  const r = document.createElement('div');
  r.id = '__toast_root';
  r.style.position = 'fixed';
  r.style.right = '12px';
  r.style.bottom = '12px';
  r.style.zIndex = 9999;
  document.body.appendChild(r);
  window.toastRoot = r;
}

export function renderTable(container, {columns, rows}){
  // ensure rows is an array (protect when API returns a single object)
  if(!Array.isArray(rows)) rows = rows ? [rows] : [];
  // accept container element or selector
  const wrap = (typeof container === 'string') ? document.querySelector(container) : container;
  if(!wrap) throw new Error('renderTable: container not found');
  // clear
  wrap.innerHTML = '';
  const table = el('table', 'table');
  const thead = el('thead'); const trh = el('tr');
  columns.forEach(c=>{
    const label = c.label || c.key || c;
    trh.appendChild(el('th','',label));
  });
  thead.appendChild(trh); table.appendChild(thead);
  const tbody = el('tbody');
  rows.forEach(r=>{
    const tr = el('tr');
    columns.forEach(c=>{
      const key = c.key || c;
      const td = el('td');
      const val = (r[key] !== undefined && r[key] !== null) ? r[key] : '';
      // if column explicitly marked raw, allow innerHTML
      if(c.raw){
        td.innerHTML = val;
      }else if(typeof val === 'string' && val.indexOf('<') !== -1 && val.indexOf('>') !== -1){
        // heuristic: contains HTML tags -> set as innerHTML (for action links)
        td.innerHTML = val;
      }else{
        td.textContent = String(val);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return table;
}

export function showToast({type='info', title='Ok', message='', timeout=3000}){
  ensureRoot();
  const t = el('div', `toast ${type}`);
  t.style.marginTop = '8px';
  t.style.minWidth = '220px';
  const content = el('div', 'content');
  content.appendChild(el('div','title', title));
  content.appendChild(el('div','msg', message));
  const close = el('button','close','×');
  close.addEventListener('click', ()=> t.remove());
  t.appendChild(content); t.appendChild(close);
  window.toastRoot.appendChild(t);
  if(timeout>0){ setTimeout(()=> t.remove(), timeout); }
  return t;
}
