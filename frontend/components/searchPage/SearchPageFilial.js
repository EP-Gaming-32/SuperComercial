'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import ShowComponent from '@/components/ShowComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { useFilial } from './useFilial';
import styles from './SearchPageProdutos.module.css';

export default function SearchPageFilial() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: results, totalPages, loading, error } = useFilial({
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
    router.push(`/filial/detalhes/${item.id_filial}`);
  }

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar produto..."
        filters={[
          { name: "id_filial",       label: "ID da Filial",     type: "text" },
          { name: "nome_filial",     label: "Nome da Filial",    type: "text" },
          { name: "endereco_filial", label: "Endereço",          type: "text" },
          { name: "telefone_filial", label: "Telefone",          type: "text" },
          { name: "email_filial",    label: "E-mail",            type: "email" },
          { name: "gestor_filial",   label: "Gestor da Filial",  type: "text" },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/filial/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["id_filial","nome_filial"]}
              onItemClick={handleItemClick}
            />
          ) : (
            <p>Nenhuma filial encontrado.</p>
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