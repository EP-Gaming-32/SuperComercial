// components/searchPage/SearchPageEstoque.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter }            from 'next/navigation';
import SearchComponent          from '@/components/SearchComponent';
import ShowComponent            from '@/components/ShowComponent';
import PaginationComponent      from '@/components/PaginationComponent';
import { useEstoque }           from './useEstoque';

export default function SearchPageEstoque() {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [page, setPage]       = useState(1);
  const { data, totalPages, loading, error } = useEstoque({ page, limit:10, filters });

  // também vamos buscar listagens auxiliares
  const [produtos, setProdutos]       = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais]         = useState([]);
  const [lotes, setLotes]             = useState([]);

  useEffect(()=>{
    Promise.all([
      fetch('/produtos?limit=100').then(r=>r.json()).then(j=>setProdutos(j.data)),
      fetch('/fornecedores').then(r=>r.json()).then(j=>setFornecedores(j)),
      fetch('/filial').then(r=>r.json()).then(j=>setFiliais(j.data)),
      fetch('/lotes?limit=100').then(r=>r.json()).then(j=>setLotes(j.data))
    ]).catch(console.error);
  },[]);

  return (
    <div>
      <SearchComponent
        keywordPlaceholder="Buscar Estoque..."
        filters={[
          { name:'id_produto',      label:'Produto',     type:'select', options:produtos,       optionKey:'id_produto',     optionLabel:'nome_produto' },
          { name:'id_fornecedor',   label:'Fornecedor',  type:'select', options:fornecedores, optionKey:'id_fornecedor',  optionLabel:'nome_fornecedor' },
          { name:'id_filial',       label:'Filial',      type:'select', options:filiais,      optionKey:'id_filial',      optionLabel:'nome_filial' },
          { name:'id_lote',         label:'Lote',        type:'select', options:lotes,        optionKey:'id_lote',        optionLabel:'codigo_lote' },
          { name:'status_estoque',  label:'Status',      type:'select', options:[
              { value:'normal', label:'Normal'},
              { value:'baixo',  label:'Baixo'},
              { value:'critico',label:'Crítico'}
            ], optionKey:'value', optionLabel:'label'  },
        ]}
        onSearch={f=>{ setFilters(f); setPage(1); }}
        addButton addButtonLabel="+" addButtonUrl="/estoque/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error   && <p className="error">{error}</p>}

      {!loading && !error && (
        data.length
          ? <ShowComponent
              data={data}
              fields={[
                'id_estoque','nome_produto','nome_fornecedor','nome_filial','codigo_lote','quantidade','status_estoque'
              ]}
              onItemClick={i=>router.push(`/estoque/detalhes/${i.id_estoque}`)}
            />
          : <p>Nenhum registro encontrado.</p>
      )}

      <PaginationComponent currentPage={page} totalPages={totalPages} onPageChange={setPage}/>
    </div>
  );
}
