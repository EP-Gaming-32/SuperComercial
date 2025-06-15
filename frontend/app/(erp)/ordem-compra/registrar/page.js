"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BoxComponent from "@/components/BoxComponent";
import FormPageOrdemCompra from "@/components/form/FormPageOrdemCompra";
import styles from "./registrar.module.css";

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();

  // 1) Filiais e seleção
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");

  // 2) Fornecedores
  const [fornecedores, setFornecedores] = useState([]);

  // 3) Pedidos da filial e itens
  const [pedidosFilial, setPedidosFilial] = useState([]);
  const [pedidosSelecionados, setPedidosSelecionados] = useState([]);
  const [produtosOriginais, setProdutosOriginais] = useState([]);

  // Loading de pedidos
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Buscar filiais ao montar
  useEffect(() => {
    fetch("http://localhost:5000/filial")
      .then(r => r.json())
      .then(j => setFiliais(j.data || []))
      .catch(console.error);

    // Também buscar fornecedores
    fetch("http://localhost:5000/fornecedores")
      .then(r => r.json())
      .then(j => setFornecedores(j.data || []))
      .catch(console.error);
  }, []);

  // Quando mudar filial, buscar pedidos pendentes
  useEffect(() => {
    if (!filialSelecionada) return;
    setLoadingPedidos(true);
    fetch(`http://localhost:5000/pedidoFilial?filial=${filialSelecionada}&status=Pendente`)
      .then(r => r.json())
      .then(j => setPedidosFilial(j.data || []))
      .catch(console.error)
      .finally(() => setLoadingPedidos(false));
  }, [filialSelecionada]);

  // Selecionar pedido e agregar itens
  const handleSelecionarPedido = pedido => {
    if (pedidosSelecionados.includes(pedido.id_pedido_filial)) return;
    fetch(`http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${pedido.id_pedido_filial}`)
      .then(r => r.json())
      .then(j => {
        setPedidosSelecionados(prev => [...prev, pedido.id_pedido_filial]);
        setProdutosOriginais(prev => [
          ...prev,
          ...j.data.map(item => ({
            id_produto: item.id_produto,
            nome_produto: item.nome_produto,
            quantidade: item.quantidade,
            preco_unitario: 0
          }))
        ]);
      })
      .catch(console.error);
  };

  // Submissão final
  const handleSubmit = async payload => {
    try {
      const res = await fetch("http://localhost:5000/ordemCompra/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          pedidos_filial: pedidosSelecionados
        })
      });
      if (!res.ok) throw new Error();
      alert("Ordem criada e pedidos atualizados!");
      router.push('/ordem-compra/visualizar');
    } catch (err) {
      console.error(err);
      alert("Erro ao criar ordem de compra");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Criar Ordem de Compra</h1>

      <BoxComponent className={styles.section}>
        <label>Filial *</label>
        <select
          value={filialSelecionada}
          onChange={e => {
            setFilialSelecionada(e.target.value);
            setPedidosFilial([]);
            setPedidosSelecionados([]);
            setProdutosOriginais([]);
          }}
        >
          <option value="">Selecione...</option>
          {filiais.map(f => (
            <option key={f.id_filial} value={f.id_filial}>
              {f.nome_filial}
            </option>
          ))}
        </select>
      </BoxComponent>

      {loadingPedidos ? (
        <p>Carregando pedidos...</p>
      ) : (
        pedidosFilial.length > 0 && (
          <BoxComponent className={styles.section}>
            <h3>Pedidos Pendentes</h3>
            <ul className={styles.pedidosList}>
              {pedidosFilial.map(p => (
                <li key={p.id_pedido_filial}>
                  <button onClick={() => handleSelecionarPedido(p)}>
                    #{p.id_pedido_filial} — {p.data_pedido.split('T')[0]}
                  </button>
                </li>
              ))}
            </ul>
          </BoxComponent>
        )
      )}

      <BoxComponent className={styles.section}>
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