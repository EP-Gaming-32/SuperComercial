// components/ItemComponent.js

"use client";
import React from "react";
import styles from "./ItemComponent.module.css"; // Seus estilos para ItemComponent

// ===============================================
// FUNÇÃO PARA FORMATAR A DATA PARA EXIBIÇÃO
// ===============================================
// Esta função agora é mais robusta para lidar com datas no formato ISO 8601 (vindo da API)
const formatarData = (dataString) => {
    if (!dataString) return '';

    // Tenta remover tags HTML (para segurança e limpeza)
    const cleanDataString = typeof dataString === 'string' 
                            ? dataString.replace(/<[^>]*>?/gm, '') 
                            : dataString;
    
    // Tenta parsear a string como um objeto Date
    const dataObjeto = new Date(cleanDataString);

    // Verifica se a data é válida (isNaN(getTime()) é a forma canônica de verificar validade de Date)
    if (isNaN(dataObjeto.getTime())) {
        // Se a data for inválida, e ela tem o formato dd/mm/yyyy (do input de busca), exibe como está.
        // Isso cobre o caso em que a busca retorna algo que não é uma data válida ainda.
        const dateRegexWithSlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (typeof cleanDataString === 'string' && dateRegexWithSlash.test(cleanDataString)) {
            return cleanDataString;
        }
        return 'Data Inválida'; // Se não conseguir parsear e não for dd/mm/yyyy, é inválida
    }

    // Se for uma data válida, formata para DD/MM/YYYY
    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0'); 
    const ano = dataObjeto.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
};


export default function ItemComponent({ item, fields, onClick, endpoint, idField }) {
    const handleDelete = async (e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(
            "Tem certeza que deseja inativar este item?"
        );
        if (!confirmDelete) return;

        if (!idField || !item[idField]) {
            alert("ID do item não identificado para inativação.");
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
                    try {
                        const data = JSON.parse(errorText);
                        alert(data.message || "Erro ao inativar.");
                    } catch (jsonError) {
                        alert("Erro inesperado no servidor (JSON inválido). Veja console.");
                    }
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
                            {/* Formata a data se o campo for data_pedido ou data_ordem */}
                            {(key === 'data_pedido' || key === 'data_ordem')
                                ? formatarData(fieldValue)
                                : fieldValue}
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