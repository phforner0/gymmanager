import { showToast } from '../ui.js';
import { apiGet, apiPost } from '../api.js';

let classesData = [];

function renderGrid(data){
  const grid = document.querySelector('[style*="grid-template-columns:repeat(7)"]');
  if(!grid) return;
  grid.innerHTML = '';
  data.week.forEach((day, i)=>{
    const col = document.createElement('div');
    col.style.cssText = "padding:12px;background:#f8fafc;border-radius:8px;min-height:120px;";
    col.innerHTML = `<strong>${day.day}</strong>`;
    day.items.forEach((cl, idx)=>{
      const b = document.createElement('div');
      b.style.cssText = "margin-top:6px;background:#fff;border-radius:8px;padding:6px;cursor:pointer;";
      b.textContent = `${cl.time} • ${cl.title} (${cl.capacity} vagas)`;
      b.setAttribute('data-day', i);
      b.setAttribute('data-idx', idx);
      b.setAttribute('draggable','true');
      b.addEventListener('dragstart', (ev)=>{ ev.dataTransfer.setData('text/plain', JSON.stringify({fromDay:i,fromIdx:idx})); });
      b.addEventListener('click', ()=> openClassModal(i, idx));
      col.appendChild(b);
    });
    grid.appendChild(col);
  });
}

export async function loadClasses(){
  try{
    const data = await apiGet('/classes');
    classesData = data;
    renderGrid(classesData);
  }catch(e){
    showToast({type:'error', title:'Erro', message:'Falha ao carregar agenda.'});
  }
}
loadClasses();

// Modal logic
let editing = null;
function openClassModal(dayIdx=null, itemIdx=null){
  editing = { dayIdx, itemIdx };
  const modal = document.querySelector('#classModal');
  const title = document.querySelector('#classModalTitle');
  const dayIn = document.querySelector('#class_day');
  const timeIn = document.querySelector('#class_time');
  const titleIn = document.querySelector('#class_title');
  const capIn = document.querySelector('#class_capacity');
  if(dayIdx !== null && itemIdx !== null){
    const cl = classesData.week[dayIdx].items[itemIdx];
    title.textContent = 'Editar Aula';
    dayIn.value = classesData.week[dayIdx].day;
    timeIn.value = cl.time;
    titleIn.value = cl.title;
    capIn.value = cl.capacity;
  }else{
    title.textContent = 'Criar Aula';
    dayIn.value = '';
    timeIn.value = '';
    titleIn.value = '';
    capIn.value = 10;
  }
  modal.style.display = 'block';
}

function closeClassModal(){ document.querySelector('#classModal').style.display = 'none'; editing = null; }

document.addEventListener('DOMContentLoaded', ()=>{
  const btnNew = document.querySelector('#btnNewClass');
  if(btnNew) btnNew.addEventListener('click', ()=> openClassModal(null,null));
  const save = document.querySelector('#classSave');
  const cancel = document.querySelector('#classCancel');
  if(cancel) cancel.addEventListener('click', ()=> closeClassModal());
  if(save) save.addEventListener('click', async ()=>{
    const dayVal = document.querySelector('#class_day').value.trim();
    const timeVal = document.querySelector('#class_time').value.trim();
    const titleVal = document.querySelector('#class_title').value.trim();
    const capVal = parseInt(document.querySelector('#class_capacity').value,10) || 0;
    if(!dayVal || !timeVal || !titleVal){ return showToast({type:'error', title:'Erro', message:'Preencha todos os campos.'}); }
    try{
      if(editing && editing.dayIdx !== null && editing.itemIdx !== null){
        // update existing
        classesData.week[editing.dayIdx].items[editing.itemIdx].time = timeVal;
        classesData.week[editing.dayIdx].items[editing.itemIdx].title = titleVal;
        classesData.week[editing.dayIdx].items[editing.itemIdx].capacity = capVal;
        await apiPost('/classes/edit', {day: dayVal, time: timeVal, title: titleVal, capacity: capVal});
        showToast({type:'success', title:'Atualizado', message:'Aula alterada.'});
      }else{
        // find day index by name, or create if not exists
        let di = classesData.week.findIndex(d=>d.day===dayVal);
        if(di === -1){
          classesData.week.push({day: dayVal, items: []});
          di = classesData.week.length -1;
        }
        classesData.week[di].items.push({title: titleVal, time: timeVal, capacity: capVal});
        await apiPost('/classes/create', {day:dayVal, time:timeVal, title:titleVal, capacity:capVal});
        showToast({type:'success', title:'Criado', message:'Aula criada.'});
      }
      renderGrid(classesData);
      closeClassModal();
    }catch(e){
      console.error(e);
      showToast({type:'error', title:'Erro', message:'Falha ao salvar aula.'});
    }
  });
});

function wireDrop(){
  const cols = document.querySelectorAll('[style*="min-height:120px;"]');
  cols.forEach((col, dayIdx)=>{
    col.addEventListener('dragover', (ev)=>{ ev.preventDefault(); col.style.background='#eef'; });
    col.addEventListener('dragleave', (ev)=>{ col.style.background=''; });
    col.addEventListener('drop', async (ev)=>{
      ev.preventDefault(); col.style.background='';
      try{
        const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
        const fromDay = data.fromDay; const fromIdx = data.fromIdx; const toDay = dayIdx;
        if(fromDay==null) return;
        const item = classesData.week[fromDay].items.splice(fromIdx,1)[0];
        if(!item) return;
        classesData.week[toDay].items.push(item);
        await apiPost('/classes/drag',{fromDay,fromIdx,toDay,item});
        renderGrid(classesData);
        showToast({type:'success', title:'Movido', message:'Aula reposicionada.'});
      }catch(e){ console.error(e); showToast({type:'error', title:'Erro', message:'Falha ao mover aula.'}); }
    });
  });
}
// re-wire drop after renderGrid
const _oldRender = renderGrid;
renderGrid = function(data){ _oldRender(data); wireDrop(); };


// --- Enhanced drag & drop with visual placeholder (P2 phase 2) ---
import { moveItemInWeek } from '../utils/classes-utils.js';

function wireDropEnhanced(){
  const cols = document.querySelectorAll('[style*="min-height:120px;"]');
  let placeholder = document.getElementById('__class_placeholder');
  if(!placeholder){
    placeholder = document.createElement('div'); placeholder.id='__class_placeholder';
    placeholder.style.cssText = 'margin-top:6px;background:#fff;border-radius:8px;padding:8px;border:2px dashed #bbb;opacity:0.95;';
    placeholder.textContent = 'Solte aqui';
  }
  cols.forEach((col, dayIdx)=>{
    col.addEventListener('dragover', (ev)=>{
      ev.preventDefault(); col.style.background='#eef';
      const rect = col.getBoundingClientRect();
      const relY = ev.clientY - rect.top;
      const children = Array.from(col.querySelectorAll('[draggable=true]'));
      let inserted = false;
      for(const child of children){
        const cRect = child.getBoundingClientRect();
        const childMid = cRect.top - rect.top + cRect.height/2;
        if(relY < childMid){
          if(child.parentNode && child.parentNode === col && child !== placeholder){
            col.insertBefore(placeholder, child);
            inserted = true; break;
          }
        }
      }
      if(!inserted && placeholder.parentNode !== col){
        col.appendChild(placeholder);
      }
    });
    col.addEventListener('dragleave', (ev)=>{ col.style.background=''; if(placeholder.parentNode===col) placeholder.remove(); });
    col.addEventListener('drop', async (ev)=>{
      ev.preventDefault(); col.style.background=''; try{
        const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
        const fromDay = data.fromDay; const fromIdx = data.fromIdx;
        // determine toIdx based on placeholder position
        const children = Array.from(col.querySelectorAll('[draggable=true]')).filter(node => node !== placeholder);
        let toIdx = children.length;
        if(placeholder.parentNode === col){
          // find index where placeholder is placed among children
          const allNodes = Array.from(col.querySelectorAll('[draggable=true], #__class_placeholder'));
          toIdx = allNodes.indexOf(placeholder);
        }
        // perform move in data model using utility
        moveItemInWeek(classesData.week, fromDay, fromIdx, dayIdx, toIdx);
        await apiPost('/classes/drag',{fromDay,fromIdx,dayIdx,toIdx});
        // re-render and cleanup
        renderGrid(classesData);
        if(placeholder.parentNode) placeholder.remove();
        showToast({type:'success', title:'Movido', message:'Aula reposicionada.'});
      }catch(e){ console.error(e); showToast({type:'error', title:'Erro', message:'Falha ao mover aula.'}); if(placeholder.parentNode) placeholder.remove(); }
    });
  });
}
// wrap existing renderGrid to wire placeholder after render
try{
  const _oldRender = renderGrid;
  renderGrid = function(data){ _oldRender(data); wireDropEnhanced(); };
}catch(e){ /* if renderGrid not defined, ignore */ }
