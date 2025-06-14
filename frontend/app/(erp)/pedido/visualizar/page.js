"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function PedidoPage() {
  const [filiais, setFiliais] = useState([]);
  const [statusOptions] = useState([
    { value: "Pendente", label: "Pendente" },
    { value: "Atendido", label: "Atendido" },
    { value: "Cancelado", label: "Cancelado" },
  ]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try {
        console.log("[PedidoPage] buscando filiais");
        const filialResposta = await fetch("http://localhost:5000/filial");
        const filialData = await filialResposta.json();

        setFiliais(filialData.data || filialData || []);
        console.log("[PedidoPage] filiais: ", filialData);
      } catch (err) {
        console.error("[PedidoPage] Erro ao carregar filiais", err);
      } finally {
        setCarregando(false);
      }
    }

    fetchFilters();
  }, []);

  if (carregando) return <p>Carregando filtros...</p>;

  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title="Pedidos de Filial"
          endpoint="pedidoFilial"
          hookParams={{ limit: 10 }}
          filters={[
            {
              name: "id_filial",
              label: "Filial",
              type: "select",
              options: filiais.map((fi) => ({
                value: fi.id_filial,
                label: fi.nome_filial,
              })),
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            {
              name: "data_pedido",
              label: "Data do Pedido",
              type: "text",
            },
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar pedido"
          detailRoute="/pedido/detalhes"
          idField="id_pedido_filial"
          showFields={[
            { value: "nome_filial", label: "Filial" },
            { value: "status", label: "Status Atual" },
            { value: "data_pedido", label: "Data do Pedido" },
          ]}
          addButtonUrl="/pedido/registrar"
          addButtonLabel="Registrar Pedido"
        />
      </BoxComponent>
    </div>
  );
}