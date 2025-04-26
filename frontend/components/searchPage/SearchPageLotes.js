'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent   from '@/components/ShowComponent';
import Pagination      from '@/components/PaginationComponent';
import { useLotes }    from './useLotes';

export default function SearchPageLotes() {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [page,    setPage]    = useState(1);
  const { data, totalPages, loading, error } = useLotes({ page, limit:10, filters });

  return (
    <div>
      <SearchComponent
        keywordPlaceholder="Buscar lote..."
        filters={[
          { name:'codigo_lote', label:'Código Lote', placeholder:'Digite o código' },
          { name:'id_produto', label:'Produto', type:'number' }
        ]}
        onSearch={f=>{ setFilters(f); setPage(1); }}
        addButton addButtonLabel="+" addButtonUrl="/lotes/registrar"
      />
      {loading && <p>Carregando...</p>}
      {error   && <p className="error">{error}</p>}
      {!loading && !error &&
        ( data.length
          ? <ShowComponent data={data} fields={['id_lote','codigo_lote','quantidade']} onItemClick={i=>router.push(`/lotes/detalhes/${i.id_lote}`)} />
          : <p>Nenhum lote encontrado.</p>
        )
      }
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
