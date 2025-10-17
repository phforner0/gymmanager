import { renderTable, showToast } from '../ui.js';
import { apiGet, apiPost } from '../api.js';

let allPayments = [];

function formatCurrency(v){ return (typeof v === 'number') ? `R$ ${v.toLocaleString('pt-BR',{minimumFractionDigits:2})}` : v; }

function safeCsvCell(v){
  if(v===null || v===undefined) return '';
  const s = String(v);
  if (/^[=+\-@]/.test(s)) return '=' + s;
  return s.replace(/"/g,'""');
}

function downloadCsv(filename, headers, rows){
  const csv = [headers.join(','), ...rows.map(r=> r.map(c=>`"${safeCsvCell(c)}"`).join(','))].join('\n');
  const blob = new Blob(["\uFEFF" + csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function renderPayments(filtered){
  const container = document.querySelector('.card');
  renderTable(container, {
    columns:[
      {key:'date',label:'Data'},
      {key:'student',label:'Aluno'},
      {key:'amount',label:'Valor'},
      {key:'status',label:'Status'},
      {key:'actions',label:'Ações', raw:true}
    ],
    rows: filtered.map((p, idx)=>({
      date: p.date,
      student: p.student,
      amount: formatCurrency(p.amount || p.amount),
      status: p.status,
      actions: `<button class="btn confirm" data-idx="${idx}">Confirmar</button> <button class="btn danger refund" data-idx="${idx}">Estornar</button> <button class="btn" data-idx="${idx}" data-action="link">Gerar link</button>`
    }))
  });
  // wire action buttons
  const confs = document.querySelectorAll('.confirm');
  confs.forEach(b=> b.addEventListener('click', async (e)=>{
    const idx = parseInt(b.getAttribute('data-idx'),10);
    try{
      await apiPost('/payments/confirm', {idx});
      if(allPayments[idx]) allPayments[idx].status = 'Recebido';
      renderPayments(allPayments);
      showToast({type:'success', title:'OK', message:'Pagamento marcado como recebido.'});
    }catch(e){
      console.error(e);
      showToast({type:'error', title:'Erro', message:'Falha ao confirmar pagamento.'});
    }
  }));
  const refunds = document.querySelectorAll('.refund');
  refunds.forEach(b=> b.addEventListener('click', async (e)=>{
    const idx = parseInt(b.getAttribute('data-idx'),10);
    try{
      await apiPost('/payments/refund', {idx});
      if(allPayments[idx]) allPayments[idx].status = 'Estornado';
      renderPayments(allPayments);
      showToast({type:'success', title:'OK', message:'Pagamento estornado.'});
    }catch(e){
      console.error(e);
      showToast({type:'error', title:'Erro', message:'Falha ao estornar pagamento.'});
    }
  }));
}

async function loadAll(){
  try{
    allPayments = await apiGet('/payments');
    renderPayments(allPayments);
  }catch(e){
    showToast({type:'error', title:'Erro', message:'Falha ao carregar pagamentos.'});
  }
}

function applyFilters(){
  const from = document.querySelector('#fromDate') ? document.querySelector('#fromDate').value : '';
  const to = document.querySelector('#toDate') ? document.querySelector('#toDate').value : '';
  const status = document.querySelector('#statusFilter') ? document.querySelector('#statusFilter').value : '';
  let filtered = Array.isArray(allPayments) ? allPayments.slice() : [];
  if(from) filtered = filtered.filter(p=> p.date >= from);
  if(to) filtered = filtered.filter(p=> p.date <= to);
  if(status) filtered = filtered.filter(p=> (p.status||'').toLowerCase() === status.toLowerCase());
  renderPayments(filtered);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.querySelector('#btnFilter'); const exp = document.querySelector('#btnExportPayments');
  if(btn) btn.addEventListener('click', applyFilters);
  if(exp) exp.addEventListener('click', ()=>{
    if(!Array.isArray(allPayments)) return showToast({type:'error', title:'Erro', message:'Sem dados'});
    const headers = ['date','student','amount','status'];
    const rows = allPayments.map(p=> [p.date, p.student, p.amount, p.status]);
    downloadCsv('payments_export.csv', headers, rows);
    showToast({type:'success', title:'Exportado', message:'CSV de pagamentos gerado.'});
  });
  loadAll();
});

// payment link modal logic (P2)
document.addEventListener('click', async (e)=>{
  if(e.target && e.target.getAttribute && e.target.getAttribute('data-action')==='link'){
    const idx = parseInt(e.target.getAttribute('data-idx'),10);
    try{
      const res = await apiPost('/payments/link',{idx});
      const link = res && res.link ? res.link : `https://pay.mock/p/${Math.random().toString(36).slice(2,9)}`;
      const modal = document.querySelector('#paymentLinkModal');
      const input = document.querySelector('#paymentLinkInput');
      if(modal && input){ input.value = link; modal.style.display='block'; }
    }catch(err){ console.error(err); showToast({type:'error', title:'Erro', message:'Falha ao gerar link.'}); }
  }
});

// copy / close
document.addEventListener('DOMContentLoaded', ()=>{
  const close = document.querySelector('#paymentLinkClose');
  const copy = document.querySelector('#paymentLinkCopy');
  if(close) close.addEventListener('click', ()=> document.querySelector('#paymentLinkModal').style.display='none');
  if(copy) copy.addEventListener('click', ()=>{
    const input = document.querySelector('#paymentLinkInput'); if(!input) return;
    input.select(); try{ document.execCommand('copy'); showToast({type:'success', title:'Copiado', message:'Link copiado para a área de transferência.'}); }catch(e){ console.warn('copy failed', e); }
  });
});
