import { defineStore } from 'pinia';
import type { GioHangItemModel, GioHangModel } from '../models/dto/response/gio-hang/gio-hang.model';
import { GioHangService } from '../services/gio-hang.service';

interface CartState {
  items: GioHangItemModel[];
  loading: boolean;
  lastFetchedAt: number | null;
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    loading: false,
    lastFetchedAt: null,
  }),
  getters: {
    totalQuantity: (state) => state.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    hasItems: (state) => state.items.length > 0,
  },
  actions: {
    setItemsFromResponse(cart: GioHangModel | null) {
      this.items = cart?.items ?? [];
      this.lastFetchedAt = Date.now();
    },
    async fetchCart(userId: string) {
      if (!userId) {
        this.reset();
        return;
      }
      if (process.server) {
        return;
      }
      try {
        this.loading = true;
        const cart = await GioHangService.getGioHangByUserId(userId);
        this.setItemsFromResponse(cart);
      } catch (error) {
        console.error('Không thể tải giỏ hàng:', error);
        this.reset();
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.items = [];
      this.lastFetchedAt = null;
    },
  },
});
