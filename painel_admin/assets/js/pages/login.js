import { showToast } from '../ui.js';
import { apiPost } from '../api.js';
import { Validators, applyValidation } from '../validate.js';

const form = document.querySelector('#loginForm');
applyValidation(form, {
  email: [Validators.required, Validators.email],
  password: [Validators.required, Validators.min(6)]
}, {
  onValid: async (fd)=>{
    const data = Object.fromEntries(fd.entries());
    const res = await apiPost('/auth/login', data);
    showToast({type:'success', title:'Login', message:'Autenticado com sucesso (mock).'});
    setTimeout(()=> location.href = '/index.html', 600);
  },
  onInvalid: ()=> showToast({type:'error', title:'Erro', message:'Revise os campos destacados.'})
});
