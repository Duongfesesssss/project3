// Hàm sử dụng để hiển thị dialog xác nhận implement từ primevue confirm dialog
// Khi xử lý event hiện dialog cần truyền vào param confirm = useConfirm() để tránh bị lỗi: "No PrimeVue Confirmation provided!"
export function useConfirmDialog() {
  const showConfirmDialog = (
    confirm: any,
    message: string,
    header: string,
    icon: string,
    accept: () => void,
    reject: () => void,
    acceptClass?: string,
    rejectClass?: string,
  ) => {
    confirm.require({
      group: 'templateConfirmDialog',
      message: message,
      header: header,
      icon: icon,
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy bỏ',
      acceptIcon: 'pi pi-check mx-0 mr-2',
      rejectIcon: 'pi pi-times mx-0 mr-2',
      acceptClass:
        'px-2 py-2 bg-sky-500 hover:bg-sky-700 !border-none text-white'
        + acceptClass,
      rejectClass:
        'px-2 py-2 bg-red-500 hover:bg-red-600 !border-none text-red'
        + rejectClass,
      accept: accept,
      reject: reject,
    });
  };

  return { showConfirmDialog };
}
