/** Simple validators **/
export const Validators = {
  required: (v)=> v!=null && String(v).trim()!=='' || 'Campo obrigatório.',
  email: (v)=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || 'E-mail inválido.',
  min: (n)=>(v)=> String(v||'').length>=n || `Mínimo de ${n} caracteres.`,
}

export function applyValidation(form, rules, {onValid, onInvalid}={}){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let firstError = null;
    Object.entries(rules).forEach(([name, validators])=>{
      const input = form.querySelector(`[name="${name}"]`) || form.querySelector(`#${name}`);
      if(!input) return;
      const value = input.value;
      let errorMsg = null;
      for(const v of validators){
        const res = typeof v==='function' ? v(value) : true;
        if(res!==true){ errorMsg = res; break; }
      }
      const errEl = input.closest('.form-row')?.querySelector('.error-text');
      input.classList.remove('error','success');
      if(errorMsg){
        input.classList.add('error');
        if(errEl) errEl.textContent = errorMsg; else {
          const eSpan = document.createElement('div'); eSpan.className='error-text'; eSpan.textContent = errorMsg;
          input.closest('.form-row')?.appendChild(eSpan);
        }
        if(!firstError) firstError = input;
      }else{
        input.classList.add('success');
        if(errEl) errEl.textContent = '';
      }
    });
    if(firstError){
      firstError.focus();
      onInvalid && onInvalid();
    }else{
      onValid && onValid(new FormData(form));
    }
  });
}
