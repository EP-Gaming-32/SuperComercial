"use client";
import React, { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

export default function EstoqueTreemap() {
  const [data, setData] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");

  // Buscar lista de filiais
  useEffect(() => {
    fetch("http://localhost:5000/filial?page=1&limit=100")
      .then((res) => res.json())
      .then((resposta) => {
        const lista = resposta.data.map((f) => ({
          id: f.id_filial.toString(),
          nome: f.nome_filial,
        }));
        setFiliais(lista);
        if (lista.length > 0) {
          setFilialSelecionada(lista[0].nome); // usamos nome_filial como chave
        }
      })
      .catch((err) => console.error("Erro ao buscar filiais:", err));
  }, []);

  // Buscar dados do relatório de estoque
  useEffect(() => {
    async function fetchEstoque() {
      try {
        const response = await fetch("http://localhost:5000/relatorios/estoque-filial");
        const rawData = await response.json();

        // Agrupar por nome_filial
        const agrupado = rawData.reduce((acc, item) => {
          const { nome_filial, nome_produto, quantidade } = item;

          let filial = acc.find((f) => f.name === nome_filial);
          if (!filial) {
            filial = { name: nome_filial, children: [] };
            acc.push(filial);
          }

          filial.children.push({
            name: nome_produto,
            stock: quantidade,
          });

          return acc;
        }, []);

        setData(agrupado);
      } catch (error) {
        console.error("Erro ao buscar dados de estoque:", error);
      }
    }

    fetchEstoque();
  }, []);

  // Dados filtrados por filial selecionada
  const dadosFiltrados = data.find((f) => f.name === filialSelecionada)?.children || [];

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Relatório de Estoque por Loja</h3>

      <div className="mb-4">
        <label className="mr-2 font-semibold" htmlFor="filialSelect">Filial:</label>
        <select
          id="filialSelect"
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.nome}>
              {filial.nome}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={dadosFiltrados}
          dataKey="stock"
          nameKey="name"
          stroke="#fff"
          fill="#82ca9d"
          content={<CustomTreemapContent />}
          isAnimationActive={false}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

// Treemap personalizado
const CustomTreemapContent = (props) => {
  const { depth, x, y, width, height, name, payload } = props;
  const stock = payload?.stock;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={depth === 0 ? "#82ca9d" : "#8dd1e1"}
        stroke="#fff"
      />
      {width > 60 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {name} {stock !== undefined ? `(${stock})` : ""}
        </text>
      )}
    </g>
  );
};
