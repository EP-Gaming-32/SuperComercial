'use client';
import { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageLote({ data, produtos=[], mode, onSubmit, onCancel }) {
  const [form, setForm] = useState({});
  useEffect(() => setForm(data||{}), [data]);

  const handleChange = e => {
    const { name,value } = e.target;
    setForm(f=>({ ...f, [name]: value }));
  };
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  const campos = [
    { name:'id_produto',      label:'Produto',     type:'select', options:produtos, optionKey:'id_produto', optionLabel:'nome_produto' },
    { name:'codigo_lote',      label:'Código Lote', type:'text', maxLength: 20   },
    { name:'data_expedicao',   label:'Expedição',   type:'date'   },
    { name:'data_validade',    label:'Validade',     type:'date'   },
    { name:'quantidade',       label:'Quantidade',   type:'number' }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campos.map(({name,label,type,options,optionKey,optionLabel, maxLength})=>(
        <div key={name} className={styles.field}>
          <label>{label}</label>
          {type==='select'
            ? <select name={name} value={form[name]||''} onChange={handleChange}>
                <option value="">Selecione...</option>
                {options.map(o=>(
                  <option key={o[optionKey]} value={o[optionKey]}>{o[optionLabel]}</option>
                ))}
              </select>
            : <input type={type} name={name} value={form[name]||''} onChange={handleChange}
            {...(type === 'text' && maxLength ? { maxLength } : {})}
            />
          }
          
        </div>
      ))}
      <div className={styles.buttonGroup}>
        {onCancel && <button type="button" onClick={onCancel}>Voltar</button>}
        <button type="submit">{mode==='edit'?'Atualizar':'Cadastrar'}</button>
      </div>
    </form>
  );
}
