<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">📝 Đánh giá khách hàng</h2>

    <!-- Rating Overview -->
    <div v-if="reviewData" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Overall Rating -->
      <div class="text-center p-6 bg-gray-50 rounded-lg">
        <div class="text-4xl font-bold text-yellow-500 mb-2">
          {{ reviewData.statistics.average_rating.toFixed(1) }}
        </div>
        <div class="flex justify-center text-yellow-400 text-xl mb-2">
          <i v-for="star in 5" :key="star" 
             :class="star <= Math.round(reviewData.statistics.average_rating) ? 'pi pi-star-fill' : 'pi pi-star'"
          ></i>
        </div>
        <p class="text-gray-600">{{ reviewData.statistics.total_reviews }} đánh giá</p>
      </div>

      <!-- Rating Distribution -->
      <div class="space-y-2">
        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center space-x-3">
          <span class="text-sm font-medium w-8">{{ rating }} ⭐</span>
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${getRatingPercentage(rating)}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-600 w-8">{{ reviewData.statistics.rating_distribution[rating] }}</span>
        </div>
      </div>
    </div>

    <!-- Write Review Section (if user can review) -->
    <div v-if="canWriteReview" class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">✍️ Viết đánh giá của bạn</h3>
      
      <div v-if="!showReviewForm">
        <Button 
          @click="showReviewForm = true"
          label="Viết đánh giá" 
          icon="pi pi-star"
          class="!bg-blue-600 hover:!bg-blue-700"
        />
      </div>

      <div v-else class="space-y-4">
        <!-- Rating Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Đánh giá sao</label>
          <div class="flex space-x-1">
            <button
              v-for="star in 5" :key="star"
              @click="userRating = star"
              class="text-2xl transition-colors"
              :class="star <= userRating ? 'text-yellow-400' : 'text-gray-300'"
            >
              <i class="pi pi-star-fill"></i>
            </button>
          </div>
        </div>

        <!-- Comment Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bình luận</label>
          <Textarea
            v-model="userComment"
            rows="4"
            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            class="w-full"
            :maxlength="1000"
          />
          <div class="text-right text-sm text-gray-500 mt-1">
            {{ userComment.length }}/1000
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <Button
            @click="submitReview"
            :loading="submitting"
            label="Gửi đánh giá"
            icon="pi pi-check"
            class="!bg-green-600 hover:!bg-green-700"
            :disabled="!userRating || !userComment.trim()"
          />
          <Button
            @click="cancelReview"
            label="Hủy"
            outlined
            class="!border-gray-300 !text-gray-600"
          />
        </div>
      </div>
    </div>

    <!-- Existing Review (if user already reviewed) -->
    <div v-else-if="userExistingReview" class="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">✅ Đánh giá của bạn</h3>
      
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="flex text-yellow-400 text-lg">
            <i v-for="star in 5" :key="star" 
               :class="star <= userExistingReview.rating ? 'pi pi-star-fill' : 'pi pi-star'"
            ></i>
          </div>
        </div>
        <div class="flex-1">
          <p class="text-gray-700">{{ userExistingReview.comment }}</p>
          <p class="text-sm text-gray-500 mt-2">
            Đánh giá vào {{ formatDate(userExistingReview.created_at) }}
          </p>
        </div>
        <div class="flex-shrink-0">
          <Button
            @click="editExistingReview"
            icon="pi pi-pencil"
            text
            class="!text-blue-600"
            v-tooltip="'Chỉnh sửa đánh giá'"
          />
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-6">
      <!-- Sort Options -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          Tất cả đánh giá ({{ reviewData?.statistics.total_reviews || 0 }})
        </h3>
        <Dropdown
          v-model="sortOption"
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Sắp xếp theo"
          class="w-48"
          @change="loadReviews"
        />
      </div>

      <!-- Reviews -->
      <div v-if="reviewData?.reviews.length" class="space-y-6">
        <div v-for="review in reviewData.reviews" :key="review._id" 
             class="border-b border-gray-200 pb-6 last:border-b-0">
          
          <div class="flex items-start space-x-4">
            <!-- User Avatar -->
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {{ getReviewerInitial(review) }}
              </div>
            </div>

            <div class="flex-1">
              <!-- User Info and Rating -->
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ getReviewerName(review) }}</h4>
                  <div class="flex items-center space-x-2">
                    <div class="flex text-yellow-400">
                      <i v-for="star in 5" :key="star" 
                         :class="star <= review.rating ? 'pi pi-star-fill text-sm' : 'pi pi-star text-sm'"
                      ></i>
                    </div>
                    <span class="text-sm text-gray-600">{{ formatDate(review.created_at) }}</span>
                    <span v-if="review.verified_purchase" 
                          class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✓ Đã mua
                    </span>
                  </div>
                </div>
              </div>

              <!-- Review Comment -->
              <p class="text-gray-700 leading-relaxed">{{ review.comment }}</p>

              <!-- Review Actions -->
              <div class="flex items-center space-x-4 mt-3">
                <button class="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                  <i class="pi pi-thumbs-up text-xs"></i>
                  <span>Hữu ích ({{ review.helpful_count }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Reviews -->
      <div v-else class="text-center py-12 text-gray-500">
        <i class="pi pi-comment text-4xl mb-4"></i>
        <p class="text-lg">Chưa có đánh giá nào</p>
        <p class="text-sm">Hãy là người đầu tiên đánh giá cuốn sách này!</p>
      </div>

      <!-- Load More -->
      <div v-if="hasMoreReviews" class="text-center">
        <Button
          @click="loadMoreReviews"
          :loading="loadingMore"
          label="Xem thêm đánh giá"
          outlined
          class="!border-gray-300 !text-gray-600"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ReviewService } from '../services/review.service'
import type { ReviewModel } from '../models/dto/response/review/review.model'
import type { ReviewResponse } from '../models/dto/response/review/review-response.model'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'

interface Props {
  bookId: string
}

const props = defineProps<Props>()
const toast = useToast()

// Data
const reviewData = ref<ReviewResponse | null>(null)
const canWriteReview = ref(false)
const userExistingReview = ref<ReviewModel | null>(null)
const showReviewForm = ref(false)
const userRating = ref(0)
const userComment = ref('')
const submitting = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const orderIdForReview = ref<string>('')

// Sort options
const sortOption = ref('newest')
const sortOptions = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Đánh giá cao nhất', value: 'highest' },
  { label: 'Đánh giá thấp nhất', value: 'lowest' },
  { label: 'Hữu ích nhất', value: 'helpful' }
]

// Computed
const hasMoreReviews = computed(() => {
  if (!reviewData.value) return false
  return currentPage.value < reviewData.value.pagination.total_pages
})

// Methods
const getRatingPercentage = (rating: number): number => {
  if (!reviewData.value) return 0
  const total = reviewData.value.statistics.total_reviews
  if (total === 0) return 0
  return (reviewData.value.statistics.rating_distribution[rating] / total) * 100
}

const getReviewerName = (review: any): string => {
  const user = review?.user_id || review?.user
  return user?.display_name || user?.full_name || user?.user_name || user?.email?.split('@')[0] || 'Người dùng'
}

const getReviewerInitial = (review: any): string => {
  const name = getReviewerName(review)
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const loadReviews = async (resetPage = true) => {
  if (resetPage) currentPage.value = 1
  
  const result = await ReviewService.getBookReviews(props.bookId, {
    page: currentPage.value,
    limit: 10,
    sort: sortOption.value as any
  })
  
  if (result) {
    if (resetPage) {
      reviewData.value = result
    } else {
      // Append for load more
      if (reviewData.value) {
        reviewData.value.reviews.push(...result.reviews)
        reviewData.value.pagination = result.pagination
      }
    }
  }
}

const loadMoreReviews = async () => {
  loadingMore.value = true
  currentPage.value++
  await loadReviews(false)
  loadingMore.value = false
}

const checkUserReviewStatus = async () => {
  try {
    const result = await ReviewService.canUserReview(props.bookId)
    if (result) {
      canWriteReview.value = result.can_review
      if (result.reason === 'already_reviewed' && result.existing_review) {
        userExistingReview.value = result.existing_review
      }
      if (result.order_id) {
        orderIdForReview.value = result.order_id
      }
    }
  } catch (error) {
    // Khách vãng lai không cần kiểm tra quyền review; vẫn cho xem danh sách
    canWriteReview.value = false
  }
}

const submitReview = async () => {
  if (!userRating.value || !userComment.value.trim()) return
  
  submitting.value = true
  try {
    await ReviewService.createReview({
      book_id: props.bookId,
      order_id: orderIdForReview.value,
      rating: userRating.value,
      comment: userComment.value.trim()
    })
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đánh giá của bạn đã được gửi!',
      life: 3000
    })
    
    // Reset form and reload
    showReviewForm.value = false
    userRating.value = 0
    userComment.value = ''
    canWriteReview.value = false
    await loadReviews()
    await checkUserReviewStatus()
    
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Có lỗi xảy ra khi gửi đánh giá',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

const cancelReview = () => {
  showReviewForm.value = false
  userRating.value = 0
  userComment.value = ''
}

const editExistingReview = () => {
  if (userExistingReview.value) {
    userRating.value = userExistingReview.value.rating
    userComment.value = userExistingReview.value.comment
    showReviewForm.value = true
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadReviews(),
    checkUserReviewStatus()
  ])
})
</script>