// frontend/utils/formatters.js

/**
 * Formata CPF ou CNPJ, adicionando pontos, barras e hífen.
 * @param {string|number} value - valor bruto (somente dígitos) do CPF/CNPJ
 * @returns {string} - valor formatado
 */
export function formatCpfCnpj(value = '') {
  const digits = value.toString().replace(/\D/g, '');

  if (digits.length === 11) {
    // CPF: 000.000.000-00
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  // Se não tiver tamanho esperado, retorna valor original
  return value.toString();
}

/**
 * Formata número de telefone brasileiro.
 * @param {string} value - string de dígitos do telefone
 * @returns {string} - telefone formatado (xx) xxxx-xxxx ou (xx) x xxxx-xxxx
 */
export function formatTelefone(value = '') {
  const digits = value.toString().replace(/\D/g, '');
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  // Celular com 9 dígitos: (xx) xxxxx-xxxx
  return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7)}`;
}
