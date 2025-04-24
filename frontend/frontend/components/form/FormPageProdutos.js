import { useState, useEffect } from "react";
import styles from "./FormPageProdutos.module.css";

const FormPageProdutos = ({ data, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // dispara o submit para o componente pai
  };

  const renderFields = () =>
    Object.keys(formData).map((key) => (
      <div key={key} className={styles.field}>
        <label htmlFor={key} className={styles.label}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <input
          id={key}
          name={key}
          type="text"
          value={formData[key] ?? ""}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
    ));

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {renderFields()}
      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === "edit" ? "Atualizar" : "Cadastrar"} Produto
        </button>
      </div>
    </form>
  );
};

export default FormPageProdutos;
