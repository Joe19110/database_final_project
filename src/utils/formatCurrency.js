export const formatCurrency = (amount) => {
  // Convert to integer if it's not already
  const intAmount = Math.round(amount);
  
  // Convert to string and add thousand separators with dots
  return `Rp.${intAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}; 