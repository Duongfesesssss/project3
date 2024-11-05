/** ***'
 *
 *   Format number with numeraljs
 */

import numeral from 'numeral';

export function useNumeral() {
  if (!numeral.locales.vi) {
    numeral.register('locale', 'vi', {
      delimiters: {
        thousands: '.',
        decimal: ',',
      },
      abbreviations: {
        thousand: 'k',
        million: 'tr',
        billion: 'tỷ',
        trillion: 'nghìn tỷ',
      },
      ordinal: function (number: number) {
        return number === 1 ? 'er' : 'ème';
      },
      currency: {
        symbol: '₫',
      },
    });
  }

  numeral.locale('vi');
  /***
   *
   *    PHân cách phần nghìn dùng dấu .
        PHân cách phần lẻ dùng dấu ,
        làm tròn 2 số cuối
   */
  function formatNumber(number: number): string {
    const formatted = numeral(number).format('0.0,');
    return formatted.replace(',00', '');
  }

  return {
    formatNumber,
  };
}
