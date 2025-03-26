import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook for navigation
import styles from "./FormPageProdutos.module.css"; // Make sure the styling is in the right file

const FormPageProdutos = ({ data, mode, onSubmit }) => {
  const router = useRouter(); // To handle back navigation
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

  // Navigate back
  const handleBack = () => {
    router.back(); // Goes back to the previous page
  };

  // Dynamically render fields
  const renderFields = () => {
    return Object.keys(formData).map((key) => (
      <div key={key} className={styles.field}>
        <label className={styles.label} htmlFor={key}>
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <input
          className={styles.input}
          type="text"
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
          {mode === "edit" ? "Update" : "Add"} Product
        </button>
      </div>
    </form>
  );
};

export default FormPageProdutos;
