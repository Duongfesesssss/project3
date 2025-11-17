import { defineStore } from 'pinia';
import type { BookModel } from '../models/dto/response/book/book.model';

interface WishlistItem {
  _id: string;
  title: string;
  price?: number;
  author?: string;
  image_link?: string;
  slug?: string;
}

interface WishlistState {
  items: WishlistItem[];
  initialized: boolean;
}

const STORAGE_KEY = 'bookkie-wishlist';

export const useWishlistStore = defineStore('wishlist', {
  state: (): WishlistState => ({
    items: [],
    initialized: false,
  }),
  getters: {
    total: (state) => state.items.length,
    isFavorite: (state) => (bookId?: string) => {
      if (!bookId) return false;
      return state.items.some((item) => item._id === bookId);
    },
  },
  actions: {
    init() {
      if (this.initialized || process.server) {
        return;
      }
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        this.items = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Không thể đọc danh sách yêu thích:', error);
        this.items = [];
      }
      this.initialized = true;
    },
    persist() {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      }
    },
    toggleBook(book: BookModel & { slug?: string }): boolean {
      if (!book?._id) {
        return false;
      }
      this.init();
      const index = this.items.findIndex((item) => item._id === book._id);
      if (index !== -1) {
        this.items.splice(index, 1);
        this.persist();
        return false;
      }

      const snapshot: WishlistItem = {
        _id: book._id,
        title: book.title || 'Chưa có tiêu đề',
        price: book.price,
        author: book.author,
        image_link: book.image_link,
        slug: (book as any).slug,
      };
      this.items.unshift(snapshot);
      this.persist();
      return true;
    },
    remove(bookId: string) {
      this.items = this.items.filter((item) => item._id !== bookId);
      this.persist();
    },
    clear() {
      this.items = [];
      this.persist();
    },
  },
});
