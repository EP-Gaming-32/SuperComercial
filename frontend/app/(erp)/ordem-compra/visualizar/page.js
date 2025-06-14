// app/(erp)/pedido/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function PedidoPage() {
  const [filial, setFilial] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [statusPedido, setStatusPedido] = useState([]);
  const [carregando, setCarregando] = useState([]);

  useEffect(() => {
    async function fetchFilters() {
      try{
        console.log("[PedidoPage] buscando fornecedores, filiais");
        const [filialResposta, fornecedorResposta, statusPedidoResposta] = await Promise.all([
          fetch("http://localhost:5000/filial"),
          fetch("http://localhost:5000/fornecedores"),
          fetch("http://localhost:5000/statusPedido"),
      ]);

      const filialData = await filialResposta.json();
      const fornecedorData = await fornecedorResposta.json();
      const StatusPedidoData = await statusPedidoResposta.json();

      setFilial(filialData.data || filialData);
      setFornecedores(fornecedorData.data || fornecedorData);
      setStatusPedido(StatusPedidoData.data || StatusPedidoData);

      console.log(
        "[EstoquePage] buscou: ",
         "Fornecedores: ",
        fornecedorData,
         "filial: ",
        filialData,
         "Status Pedido: ",
         StatusPedidoData,
      );
    } catch (err) {
      console.error("[PedidoPage] Erro ao carregar filtros", err);
    } finally {
      setCarregando(false);
    }
  }

  fetchFilters();

  }, []);

  if (carregando) return <p>Carregando Filtros...</p>;

  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title=""
          endpoint="pedido"
          hookParams={{ limit: 10}}
          filters={[
            {
              name: "id_fornecedor",
              label: "Fornecedor",
              type: "select",
              options: fornecedores.map((fo) => ({
                value: fo.id_fornecedor,
                label: fo.nome_fornecedor,
              })),
            },
            {
              name: "id_filial",
              label: "Filial",
              type: "select",
              options: filial.map((fi) => ({
                value: fi.id_filial,
                label: fi.nome_filial,
              })),
            },
            {
              name: "tipo_pedido",
              label: "Tipo de Pedido",
              type: "select",
              options: [
                { value: "compra", label: "Compra" },
                { value: "reposição", label: "Reposição" },
              ],
            },
            {
              name: "valor_total",
              label: "Valor Total",
              type: "text",
            },
            {
              name: "data_pedido",
              label: "Data do Pedido",
              type: "text",
            },
            {
              name: "status_pedido",
              label: "Status",
              type: "select",
              options: statusPedido.map((status) => ({
                value: status.descricao,
                label: status.descricao,
              })),
            },
          ]}
          keywordName={null}
          keywordPlaceholder="buscar pedido"
          detailRoute="/pedido/detalhes"
          idField="id_pedido"
          showFields={[
            { value: "nome_filial", label: "Filial"},
            { value: "nome_fornecedor", label: "Fornecedor"},
            { value: "tipo_pedido", label: "Tipo"},
            { value: "valor_total", label: "Valor"},
            { value: "status_atual", label: "Status Atual" },
            { value: "data_pedido", label: "Data"},
          ]}
          addButtonUrl="/pedido/registrar"
          addButtonLabel="Registrar Pedido"
        />
      </BoxComponent>
    </div>
  )
}