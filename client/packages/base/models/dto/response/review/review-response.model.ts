import type { ReviewModel } from './review.model';
import type { ReviewStatistics } from './review-statistics.model';

export interface ReviewResponse {
  reviews: ReviewModel[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    limit: number;
  };
  statistics: ReviewStatistics;
}
