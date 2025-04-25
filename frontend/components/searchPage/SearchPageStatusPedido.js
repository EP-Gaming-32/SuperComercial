'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent from '@/components/ShowComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { useStatusPedido } from './useStatusPedido';
import styles from './SearchPageProdutos.module.css';

export default function SearchPageStatusPedido() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: results, totalPages, loading, error } = useStatusPedido({
    page: currentPage,
    limit: 10,
    filters: searchParams
  });

  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(1);
  }

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/statusPedido/detalhes/${item.id_status}`);
  }

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar produto..."
        filters={[
          { name: "id_status", label: " ID", placeholder: "ID" },
          { name: "descricao", label: "status", type: "text" },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/statusPedido/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["id_status","descricao"]}
              onItemClick={handleItemClick}
            />
          ) : (
            <p>Nenhum Forma de Pagamento encontrado.</p>
          )}

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}