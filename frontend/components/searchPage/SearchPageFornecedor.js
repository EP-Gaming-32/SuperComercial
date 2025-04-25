'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent from '@/components/ShowComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { useFornecedor } from './useFornecedor';
import styles from './SearchPageProdutos.module.css';

export default function SearchPageFornecedor() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: results, totalPages, loading, error } = useFornecedor({
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
    router.push(`/fornecedores/detalhes/${item.id_fornecedor}`);
  }

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar produto..."
        filters={[
          { name: "sku", label: "Código SKU", placeholder: "Digite SKU" },
          { name: "preco_min", label: "Preço Mínimo", type: "number" },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/fornecedores/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["id_fornecedor","nome_fornecedor"]}
              onItemClick={handleItemClick}
            />
          ) : (
            <p>Nenhum fornecedor encontrado.</p>
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