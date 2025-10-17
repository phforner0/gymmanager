import { showToast } from '../ui.js';
import { apiPost } from '../api.js';
import { Validators, applyValidation } from '../validate.js';

const form = document.querySelector('#regForm');
applyValidation(form, {
  email: [Validators.required, Validators.email],
  password: [Validators.required, Validators.min(6)]
}, {
  onValid: async (fd)=>{
    const data = Object.fromEntries(fd.entries());
    const res = await apiPost('/auth/register', data);
    showToast({type:'success', title:'Cadastro', message:'Conta criada (mock).'});
    setTimeout(()=> location.href = '/login.html', 600);
  },
  onInvalid: ()=> showToast({type:'error', title:'Erro', message:'Revise os campos destacados.'})
});
