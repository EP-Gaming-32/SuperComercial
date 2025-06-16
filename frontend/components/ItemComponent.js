// components/ItemComponent.js

"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

// Função para formatar a data
const formatarData = (dataString) => {
    if (!dataString) return '';

    // Tenta remover tags HTML se a string já vier com elas (para evitar problemas como o "math-inline")
    const cleanDataString = typeof dataString === 'string' 
                            ? dataString.replace(/<[^>]*>?/gm, '') 
                            : dataString;
    
    const dataObjeto = new Date(cleanDataString);

    if (isNaN(dataObjeto.getTime())) {
        return 'Data Inválida';
    }

    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0'); 
    const ano = dataObjeto.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
};


export default function ItemComponent({ item, fields, onClick, endpoint }) {
    const handleDelete = async (e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(
            "Tem certeza que deseja inativar este item?"
        );
        if (!confirmDelete) return;

        const idField = Object.keys(item).find((key) => key.startsWith("id_"));
        if (!idField) {
            alert("ID não identificado para inativação.");
            return;
        }

        const idValue = item[idField];

        try {
            const res = await fetch(
                `http://localhost:5000/${endpoint}/${idValue}`,
                { method: "DELETE" }
            );

            const contentType = res.headers.get("content-type");
            if (res.ok) {
                alert(
                    `${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} inativado com sucesso!`
                );
                window.location.reload(); 
            } else {
                const errorText = await res.text();
                console.error("Erro detalhado do servidor:", errorText);

                if (contentType?.includes("application/json")) {
                    const data = JSON.parse(errorText);
                    alert(data.message || "Erro ao inativar.");
                } else {
                    alert("Erro inesperado no servidor (não JSON). Veja console.");
                }
            }
        } catch (err) {
            console.error("Erro na inativação:", err);
            alert("Erro na conexão com o servidor.");
        }
    };

    return (
        <div className={styles.itemBlock} onClick={() => onClick(item)}>
            {fields.map((fieldObj, index) => {
                const key = typeof fieldObj === "string" ? fieldObj : fieldObj.value;
                const label = typeof fieldObj === "string" ? fieldObj : fieldObj.label;

                const fieldValue = item[key]; // Valor bruto do campo

                return (
                    <div
                        key={`field-${key}-${index}`}
                        className={styles.fieldBlock}
                    >
                        <span className={styles.fieldLabel}>{label}:</span>
                        <span className={styles.fieldValue}>
                            {/* ATUALIZADO: Inclui 'data_pedido' E 'data_ordem' para formatação */}
                            {(key === 'data_pedido' || key === 'data_ordem') // <--- CONDIÇÃO ATUALIZADA AQUI!
                                ? formatarData(fieldValue) // Se for um dos campos de data, formata
                                : fieldValue} {/* Caso contrário, exibe o valor normal */}
                        </span>
                    </div>
                );
            })}

            <div className={styles.fieldBlock}>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    Inativar
                </button>
            </div>
        </div>
    );
}