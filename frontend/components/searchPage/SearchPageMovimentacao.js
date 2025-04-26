'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent from '@/components/ShowComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { useMovimentacoes } from './useMovimentacoes';

export default function MovimentacoesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  // Fetch auxiliares para filtros
  const [produtos, setProdutos] = useState([]);
  const [filiais, setFiliais]   = useState([]);
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/produtos?limit=100').then(r => r.json()),
      fetch('http://localhost:5000/filial?limit=100').then(r => r.json())
    ]).then(([pJson, fJson]) => {
      setProdutos(pJson.data || []);
      setFiliais(fJson.data || []);
    }).catch(console.error);
  }, []);

  const { data, totalPages, loading, error } = useMovimentacoes({ page, limit: 10, filters });

  const handleSearch = newFilters => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div>
      <SearchComponent
        keywordPlaceholder="Buscar Movimentações..."
        filters={[
          { name: 'id_produto', label: 'Produto', type: 'select', options: produtos,   optionKey: 'id_produto', optionLabel: 'nome_produto' },
          { name: 'id_filial',   label: 'Filial',   type: 'select', options: filiais,    optionKey: 'id_filial',   optionLabel: 'nome_filial' },
          { name: 'tipo_movimentacao', label: 'Tipo', type: 'select', options: [
              { value: 'entrada', label: 'Entrada' },
              { value: 'saida',   label: 'Saída' }
            ], optionKey: 'value', optionLabel: 'label' },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/movimentacaoEstoque/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error   && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        data.length > 0 ? (
          <ShowComponent
            data={data}
            fields={[
              'id_movimentacao',
              'nome_produto',
              'nome_filial',
              'tipo_movimentacao',
              'quantidade',
              'data_movimentacao'
            ]}
            onItemClick={item => router.push(`/movimentacoes/${item.id_movimentacao}`)}
          />
        ) : (
          <p>Nenhuma movimentação encontrada.</p>
        )
      )}

      <PaginationComponent
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}