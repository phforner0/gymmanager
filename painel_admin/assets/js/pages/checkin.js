import { showToast, qs } from '../ui.js';
import { apiPost } from '../api.js';

const input = document.querySelector('#receptionSearch');
const btn = document.querySelector('.card .btn.primary');

let recent = JSON.parse(localStorage.getItem('recentCheckins')||'[]');

function renderRecent(){
  const ul = document.querySelector('#recentList');
  if(!ul) return;
  ul.innerHTML = '';
  recent.slice().reverse().forEach((r, i)=>{
    const li = document.createElement('li');
    li.style.display='flex'; li.style.alignItems='center';
    li.innerHTML = `<div style="flex:1">${r.name} • ${r.time}</div><button class="btn" data-idx="${i}">Desfazer</button>`;
    ul.appendChild(li);
  });
  // wire desfazer
  ul.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', async (ev)=>{
      const idx = parseInt(b.getAttribute('data-idx'),10);
      const item = recent.splice(recent.length - 1 - idx, 1);
      localStorage.setItem('recentCheckins', JSON.stringify(recent));
      renderRecent();
      showToast({type:'info', title:'Desfeito', message:'Check-in desfeito localmente.'});
      // optionally call API to undo if available
      try{ await apiPost('/checkins/undo',{id:item[0]?.id}); }catch(e){ console.warn('undo api failed', e); }
    });
  });
}

async function doCheckin(query){
  if(!query) return showToast({type:'error', title:'Erro', message:'Informe um nome ou código.'});
  try{
    const res = await apiPost('/checkins', {query});
    const entry = { id: res.id, name: query, time: new Date().toLocaleString() };
    recent.push(entry);
    localStorage.setItem('recentCheckins', JSON.stringify(recent));
    renderRecent();
    showToast({type:'success', title:'OK', message:'Check-in registrado.'});
  }catch(e){
    console.error(e);
    showToast({type:'error', title:'Erro', message:'Falha no check-in.'});
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderRecent();
  if(btn) btn.addEventListener('click', ()=> doCheckin(input ? input.value.trim() : ''));
});
