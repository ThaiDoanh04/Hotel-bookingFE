/**
 * Formats the price with commas for every thousand according to Vietnamese currency format.
 * @param {number} price - The price to format.
 * @returns {string} - The formatted price in VND.
 *
 * @example
 * const formattedPrice = formatPrice(1000000); // Returns '1.000.000'
 * const formattedPrice = formatPrice(1000); // Returns '1.000'
 */
const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  
  // Đảm bảo price là số
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^\d.-]/g, ''))
    : price;
  
  // Làm tròn đến số nguyên và định dạng theo tiêu chuẩn Việt Nam
  return Math.round(numericPrice).toLocaleString('vi-VN');
};

export { formatPrice };