"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";  // useParams
import BoxComponent from "@/components/BoxComponent";
import FormPageOrdemCompra from "@/components/form/FormPageOrdemCompra";
import styles from "./registrar.module.css";

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();
  const { id_pedido_filial: idPedidoFilial } = useParams();  // obter do path

  const [fornecedores, setFornecedores] = useState([]);
  const [produtosOriginais, setProdutosOriginais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const respF = await fetch("http://localhost:5000/fornecedores");
        const { data: fornec } = await respF.json();
        setFornecedores(fornec || []);

        const respI = await fetch(
          `http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${idPedidoFilial}`
        );
        const { data: itensPedido } = await respI.json();

        const respPF = await fetch(
          "http://localhost:5000/ordemCompra/produtoFornecedor"
        );
        const { data: pfList } = await respPF.json();

        // Inicializa preços em zero; depois, ao selecionar fornecedor, poderemos recomputar
        const produtos = itensPedido.map(item => ({
          id_produto: item.id_produto,
          nome_produto: item.nome_produto,
          preco_fornecedor: 0
        }));

        setProdutosOriginais(produtos);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados iniciais");
      } finally {
        setLoading(false);
      }
    }
    if (idPedidoFilial) fetchData();
    else setLoading(false);  // garante desbloqueio quando falta ID
  }, [idPedidoFilial]);

  const handleSubmit = async payload => {
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5000/ordemCompra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error();
      const { data: { id_ordem_compra } } = await resp.json();

      await fetch("http://localhost:5000/ordemCompra/vincularPedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_ordem_compra, id_pedido_filial: +idPedidoFilial })
      });

      for (const it of payload.itens) {
        await fetch("http://localhost:5000/ordemCompra/itens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_ordem_compra,
            id_produto: it.id_produto,
            quantidade: it.quantidade,
            preco_unitario: it.preco_unitario
          })
        });
      }

      alert("Ordem de Compra cadastrada com sucesso!");
      router.push('/ordem-compra/listar');
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar ordem de compra");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Ordem de Compra</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageOrdemCompra
          fornecedores={fornecedores}
          produtosOriginais={produtosOriginais}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}