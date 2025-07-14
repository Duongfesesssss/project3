
export interface UserModel {
  _id?: string;
  user_name: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'staff' | 'admin';
  is_active: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  user_name: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'staff' | 'admin'; // Role có thể chọn, mặc định là customer
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  address?: string;
  role?: string;
  is_active?: boolean;
}

export interface UserListResponse {
  status: string;
  success: boolean;
  message: string;
  data: {
    users: UserModel[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_records: number;
      limit: number;
    };
  };
}

export const UserManagementService = {
  // Lấy danh sách tất cả users (Admin only)
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await $api(url, {
      method: 'GET',
    });
  },

  // Tạo tài khoản user mới (Admin only)
  async createUser(data: CreateUserData) {
    return await $api('/api/admin/users', {
      method: 'POST',
      body: data,
    });
  },

  // Tạo tài khoản staff (Admin only) - wrapper cho createUser với role = staff
  async createStaff(data: Omit<CreateUserData, 'role'>) {
    return await this.createUser({
      ...data,
      role: 'staff'
    });
  },

  // Cập nhật thông tin user (Admin only)
  async updateUser(userId: string, data: UpdateUserData) {
    return await $api(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Khóa/mở khóa tài khoản (Admin only)
  async toggleUserStatus(userId: string) {
    return await $api(`/api/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Reset password (Admin only)
  async resetUserPassword(userId: string, newPassword: string) {
    return await $api(`/api/admin/users/${userId}/reset-password`, {
      method: 'PATCH',
      body: { newPassword },
    });
  },

  // Xóa user (Admin only - chỉ customer)
  async deleteUser(userId: string) {
    return await $api(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
};
