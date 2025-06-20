class NhaXuatBanModel {
  _id?: number;
  name?: string;
  contact?: string;
  rating?: number;
  status?: 'active' | 'inactive' | 'pending';
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export { NhaXuatBanModel }; 