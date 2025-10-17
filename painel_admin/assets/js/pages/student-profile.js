import { showToast, qs } from '../ui.js';
import { apiGet, apiPost } from '../api.js';
import { Validators, applyValidation } from '../validate.js';

const params = new URLSearchParams(location.search);
const isNew = params.get('new')==='1';
const id = params.get('id');

async function populate(){
  if(isNew) return;
  try{
    const s = await apiGet(`/students/${id}`);
    qs('#f_name').value = s.name || '';
    qs('#f_email').value = s.email || '';
    qs('#f_phone').value = s.phone || '';
    qs('#studentName').textContent = `Ficha do Aluno • ${s.name}`;
  }catch(e){
    showToast({type:'error', title:'Erro', message:'Falha ao carregar aluno.'});
  }
}
populate();

const btnSave = qs('#btnSave');
const formEl = document.createElement('form');
const container = qs('.container');
// Hook validation on button click by wrapping existing inputs in a form
applyValidation(formEl, {
  name:[Validators.required],
  email:[Validators.required, Validators.email],
  phone:[Validators.required, Validators.min(8)],
}, {
  onValid: async (fd)=>{
    const payload = {
      name: qs('#f_name').value,
      email: qs('#f_email').value,
      phone: qs('#f_phone').value
    };
    const res = await apiPost(isNew? '/students/create' : `/students/${id}/update`, payload);
    showToast({type:'success', title:'Salvo', message:'Dados do aluno salvos (mock).'});
    if(isNew) setTimeout(()=> location.href = '/students/list.html', 600);
  },
  onInvalid: ()=> showToast({type:'error', title:'Erro', message:'Revise os campos.'})
});
btnSave.addEventListener('click', (e)=>{
  e.preventDefault();
  // trigger submit programmatically
  formEl.dispatchEvent(new Event('submit', {cancelable:true}));
});
