/** ***'
 *
 *   Format date using momentjs
 */

import moment from 'moment';

export function useMoment() {
  // DateTime to DD/MM/YYYY
  function formatDate(date?: Date): string {
    if (date) {
      return moment(date).format('DD/MM/YYYY');
    }
    return '';
  }

  // DateTime to DD/MM/YYYY - MM:SS
  function formatDateTime(date?: Date): string {
    if (date) {
      return moment(date).format('DD/MM/YYYY - MM:SS');
    }
    return '';
  }

  // Hàm format dạng DD/MM/YYYY - HH:MM sang dạng HH:MM
  function formatTime(time: string): string {
    return moment(time, 'DD/MM/YYYY - HH:mm').format('HH:mm');
  }

  // hàm lấy fromDate khi biết toDate và optionId
  // 1 ngày bắt đầu từ 00:00:00 đến hiện tại
  function getFromDateAndToDateObs(
    toDate: Date,
    optionId?: number,
  ): { fromDate: Date; toDate: Date } {
    const fromDate = new Date(toDate);
    switch (optionId) {
      case 4:
        fromDate.setDate(toDate.getDate() - 0);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 5:
        fromDate.setDate(toDate.getDate() - 2);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 6:
        fromDate.setDate(toDate.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        break;
      default:
        fromDate.setDate(toDate.getDate());
        break;
    }

    return { fromDate, toDate };
  }

  // Lấy mảng các ngày từ start đến end
  const getDaysArray = function (start: Date, end: Date) {
    const arr = [];
    for (
      const dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    return arr;
  };
  return {
    formatDate,
    formatDateTime,
    getFromDateAndToDateObs,
    getDaysArray,
    formatTime,
  };
}
