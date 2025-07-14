import { defineStore } from 'pinia';

export interface User {
  id: string;
  user_name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin';
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  user_name: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff',
    isStaffOrAdmin: (state) => state.user?.role === 'staff' || state.user?.role === 'admin',
    canManageUsers: (state) => state.user?.role === 'admin',
    canViewStockHistory: (state) => state.user?.role === 'admin',
    canManageContent: (state) => state.user?.role === 'staff' || state.user?.role === 'admin',
  },

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const response = await $api('/api/auth/login', {
          method: 'POST',
          body: credentials,
        }) as any;

        if (response.success) {
          this.setAuth(response.data.user, response.data.access_token);
          return response;
        } else {
          throw new Error(response.message || 'Đăng nhập thất bại');
        }
      } catch (error: any) {
        this.clearAuth();
        throw error;
      }
    },

    async logout() {
      try {
        await $api('/api/auth/logout', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
      }
    },

    setAuth(user: User, token: string) {
      this.user = user;
      this.token = token;
      this.isAuthenticated = true;
      
      // Lưu vào localStorage
      if (process.client) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      // Xóa khỏi localStorage
      if (process.client) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },

    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            this.setAuth(user, token);
          } catch (error) {
            console.error('Error parsing user data:', error);
            this.clearAuth();
          }
        }
      }
    },
  },
});
