"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./FormPageProdutos.module.css"; // Reusing the same CSS module

const FormPageEstoque = ({ data, mode, onSubmit }) => {
  const router = useRouter();
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBack = () => {
    router.back();
  };

  const renderFields = () => {
    return Object.keys(formData).map((key) => (
      <div key={key} className={styles.field}>
        <label className={styles.label} htmlFor={key}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <input
          className={styles.input}
          type={["quantidade", "estoque_minimo", "estoque_maximo", "id_produto", "id_fornecedor", "id_filial", "id_lote"].includes(key) ? "number" : "text"}
          name={key}
          value={formData[key] || ""}
          onChange={handleChange}
          placeholder={`Enter ${key}`}
        />
      </div>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {renderFields()}
      <div className={styles.buttonGroup}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          Back
        </button>
        <button type="submit" className={styles.submitButton}>
          {mode === "edit" ? "Update" : "Add"} Item
        </button>
      </div>
    </form>
  );
};

export default FormPageEstoque;
