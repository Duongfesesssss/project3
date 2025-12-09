import { BaseService } from './base.service';
import { EnumStatus } from '../utils/enums';
import type { ReviewResponse } from '~/packages/base/models/dto/response/review/review-response.model';
import type { ReviewModel } from '~/packages/base/models/dto/response/review/review.model';

class _ReviewService extends BaseService {
  // Lấy reviews của một sách
  async getBookReviews(
    bookId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    }
  ): Promise<ReviewResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);

      const url = `${this.baseApiUrl}/api/review/book/${bookId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy reviews:', error);
      return null;
    }
  }

  // Tạo review mới
  async createReview(reviewData: {
    book_id: string;
    order_id: string;
    rating: number;
    comment: string;
  }): Promise<ReviewModel | null> {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/review/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi tạo review:', error);
      throw error;
    }
  }

  // Cập nhật review
  async updateReview(reviewId: string, updateData: {
    rating?: number;
    comment?: string;
  }): Promise<ReviewModel | null> {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/review/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAccessToken()
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi cập nhật review:', error);
      throw error;
    }
  }

  // Xóa review
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.getAccessToken()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      return res && res.status === EnumStatus.OK;
    } catch (error) {
      console.error('Lỗi khi xóa review:', error);
      throw error;
    }
  }

  // Kiểm tra user có thể review sách không
  async canUserReview(bookId: string): Promise<{
    can_review: boolean;
    reason?: 'not_purchased' | 'already_reviewed';
    existing_review?: ReviewModel;
    order_id?: string;
  } | null> {
    try {
      const response = await fetch(`${this.baseApiUrl}/api/review/can-review/${bookId}`, {
        headers: {
          'Authorization': this.getAccessToken()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền review:', error);
      return null;
    }
  }
}

const ReviewService = new _ReviewService();
export { ReviewService };