"use client";
import React, { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

export default function EstoqueTreemap() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchEstoque() {
      try {
        const response = await fetch("http://localhost:5000/relatorios/estoque-filial");
        const rawData = await response.json();

        // Agrupar por nome_filial e formatar para o Treemap
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

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Relatório de Estoque por Loja</h3>
      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={data}
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
        fill={depth === 1 ? "#82ca9d" : "#8dd1e1"}
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
