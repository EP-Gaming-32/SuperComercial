'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent from '@/components/ShowComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { useFormaPagamento } from './useFormaPagamento';
import styles from './SearchPageProdutos.module.css';

export default function SearchPageFormaPagamento() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: results, totalPages, loading, error } = useFormaPagamento({
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
    router.push(`/formaPagamento/detalhes/${item.id_forma_pagamento}`);
  }

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar produto..."
        filters={[
          { name: "id_forma_pagamento", label: " ID", placeholder: "ID" },
          { name: "descricao", label: "forma pagamento", type: "text" },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/formaPagamento/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["id_forma_pagamento","descricao"]}
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