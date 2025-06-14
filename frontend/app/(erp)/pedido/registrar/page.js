"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./registrar.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedidoFilial from "@/components/form/FormPagePedidoFilial";

export default function RegistrarPedidoFilialPage() {
  const router = useRouter();

  const initialData = {
    id_filial: "",
    data_pedido: "",
    status: "Pendente",
    observacao: ""
  };

  const [pedidoData, setPedidoData] = useState(initialData);
  const [filial, setFilial] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar filiais
        const filialResponse = await fetch("http://localhost:5000/filial");
        const filialData = await filialResponse.json();
        setFilial(filialData.data || filialData || []);

        // Buscar produtos
        const produtosResponse = await fetch("http://localhost:5000/produtos");
        const produtosData = await produtosResponse.json();
        
        // Converter valor_produto para número
        const produtosProcessados = (produtosData.data || produtosData || []).map(produto => ({
          ...produto,
          valor_produto: parseFloat(produto.valor_produto) || 0
        }));
        
        setProdutos(produtosProcessados);

        console.log("[RegistrarPedidoFilial] Dados carregados:", { 
          filiais: filialData, 
          produtos: produtosProcessados 
        });
      } catch (err) {
        console.error("[RegistrarPedidoFilial] Erro ao carregar dados:", err);
        alert("Erro ao carregar dados necessários para o formulário");
      } finally {
        setCarregando(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (dadosCompletos) => {
    try {
      console.log("[RegistrarPedidoFilial] Enviando dados:", dadosCompletos);
      
      // Validações básicas
      if (!dadosCompletos.id_filial) {
        alert("Por favor, selecione uma filial");
        return;
      }
      
      if (!dadosCompletos.produtos || dadosCompletos.produtos.length === 0) {
        alert("Por favor, adicione pelo menos um produto ao pedido");
        return;
      }

      const res = await fetch("http://localhost:5000/pedidoFilial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosCompletos),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao cadastrar pedido");
      }

      const resultado = await res.json();
      console.log("[RegistrarPedidoFilial] Pedido cadastrado:", resultado);
      
      alert("Pedido cadastrado com sucesso!");
      router.push("/pedido/visualizar");
    } catch (err) {
      console.error("[RegistrarPedidoFilial] Erro:", err);
      alert("Erro: " + err.message);
    }
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <h1>Cadastrar Pedido de Filial</h1>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Cadastrar Pedido de Filial</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPagePedidoFilial
          data={pedidoData}
          filial={filial}
          produtos={produtos}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}