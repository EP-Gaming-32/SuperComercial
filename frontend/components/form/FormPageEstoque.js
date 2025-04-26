// components/form/FormPageEstoque.jsx
'use client';
import { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageEstoque({
  data,
  produtos=[],
  fornecedores=[],
  filiais=[],
  lotes=[],
  mode, onSubmit, onCancel
}) {
  const [form, setForm] = useState({});
  useEffect(()=> setForm(data||{}), [data]);

  const handleChange = e => {
    const { name,value } = e.target;
    setForm(f=>({ ...f, [name]: value }));
  };

  const campos = [
    { name:'id_produto',     label:'Produto',     type:'select', options:produtos,      optionKey:'id_produto',     optionLabel:'nome_produto' },
    { name:'id_fornecedor',  label:'Fornecedor',  type:'select', options:fornecedores, optionKey:'id_fornecedor',  optionLabel:'nome_fornecedor' },
    { name:'id_filial',      label:'Filial',      type:'select', options:filiais,       optionKey:'id_filial',      optionLabel:'nome_filial' },
    { name:'id_lote',        label:'Lote',        type:'select', options:lotes,         optionKey:'id_lote',        optionLabel:'codigo_lote' },
    { name:'local_armazenamento', label:'Local', type:'text' },
    { name:'quantidade',     label:'Quantidade',  type:'number' },
    { name:'estoque_minimo', label:'Mínimo',      type:'number' },
    { name:'estoque_maximo', label:'Máximo',      type:'number' },
  ];

  return (
    <form onSubmit={e=>{ e.preventDefault(); onSubmit(form); }} className={styles.form}>
      {campos.map(({name,label,type,options,optionKey,optionLabel})=>(
        <div key={name} className={styles.field}>
          <label>{label}</label>
          {type==='select'
            ? <select name={name} value={form[name]||''} onChange={handleChange}>
                <option value="">Selecione...</option>
                {options.map(o=>(
                  <option key={o[optionKey]} value={o[optionKey]}>{o[optionLabel]}</option>
                ))}
              </select>
            : <input type={type} name={name} value={form[name]||''} onChange={handleChange}/>
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
