"use client";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoque from "@/components/form/FormPageEstoque";
import styles from "./detalhes.module.css";

export default function RegistrarEstoquePage() {
  const handleCreate = (newData) => {
    console.log("Novo item no estoque:", newData);
    // Aqui entraria a chamada para a API para registrar um novo item no estoque
  };

  return (
    <div className={styles.container}>
      <h1>Registrar Novo Item no Estoque</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageEstoque data={{}} mode="create" onSubmit={handleCreate} />
      </BoxComponent>
    </div>
  );
}
