<template>
  <div class="py-10 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <p class="text-sm uppercase tracking-wide text-primary">Chương trình khách hàng thân thiết</p>
        <h1 class="text-3xl font-semibold text-gray-900 dark:text-white">Thẻ thành viên của tôi</h1>
      </div>
      <Button
        icon="pi pi-refresh"
        label="Làm mới"
        class="!bg-blue-600 hover:!bg-blue-700 !border-none"
        :loading="loadingCard || loadingHistory"
        @click="refreshData"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card class="shadow-md border border-slate-100 dark:border-slate-800">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Hạng hiện tại</p>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ tierName }}</h2>
            </div>
            <Badge :value="tierBadgeLabel" severity="info" class="text-base" />
          </div>
        </template>
        <template #content>
          <p class="text-slate-600 dark:text-slate-300 mb-4">{{ tierDescription }}</p>
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-slate-500">
              <span>Điểm khả dụng</span>
              <span class="font-semibold text-slate-900 dark:text-white">{{ formatNumber(card?.points_balance) }} điểm</span>
            </div>
            <div class="flex justify-between text-sm text-slate-500">
              <span>Tổng tích lũy</span>
              <span class="font-semibold text-slate-900 dark:text-white">{{ formatNumber(card?.lifetime_points) }} điểm</span>
            </div>
            <div class="flex justify-between text-sm text-slate-500">
              <span>Tổng chi tiêu</span>
              <span class="font-semibold text-slate-900 dark:text-white">{{ formatCurrency(card?.lifetime_spend) }}</span>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-md border border-slate-100 dark:border-slate-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Lợi ích nổi bật</h3>
            <span class="text-xs text-slate-500">{{ benefits.length }} quyền lợi</span>
          </div>
        </template>
        <template #content>
          <ul class="space-y-3">
            <li
              v-for="benefit in benefits"
              :key="benefit"
              class="flex items-start gap-2 text-slate-600 dark:text-slate-300"
            >
              <i class="pi pi-check-circle text-green-500 mt-0.5" />
              <span>{{ benefit }}</span>
            </li>
            <li v-if="!benefits.length" class="text-slate-500 text-sm">Hạng hiện tại chưa có lợi ích đặc biệt.</li>
          </ul>
        </template>
      </Card>

      <Card class="shadow-md border border-slate-100 dark:border-slate-800">
        <template #header>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Đổi điểm thưởng</h3>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm text-slate-500">
              <span>Tỉ lệ quy đổi</span>
              <span class="font-semibold text-slate-900 dark:text-white">10.000đ = 1 điểm</span>
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="option in redeemOptions"
                :key="option.points"
                :class="[
                  'p-4 border rounded-lg cursor-pointer transition shadow-sm hover:shadow-md',
                  selectedOption?.points === option.points ? 'border-amber-500 bg-amber-50' : 'border-slate-200 dark:border-slate-700'
                ]"
                @click="selectOption(option)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-slate-600">Đổi {{ option.points }} điểm</p>
                    <p class="text-lg font-semibold text-slate-900 dark:text-white">
                      Giảm {{ option.discount }}% (đơn tối thiểu {{ formatCurrency(option.minOrderValue) }})
                    </p>
                  </div>
                  <Tag :value="option.discount + '% giảm'" severity="warning" />
                </div>
                <p class="text-xs text-slate-500 mt-2">Hiệu lực {{ voucherValidDays }} ngày, dùng 1 lần cho đơn từ {{ formatCurrency(option.minOrderValue) }}.</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Ghi chú</label>
              <InputText v-model="redeemForm.reason" placeholder="Ví dụ: Đổi voucher cá nhân" :disabled="redeemLoading" class="w-full" />
            </div>
            <Button
              label="Đổi điểm lấy voucher"
              icon="pi pi-gift"
              class="w-full !bg-amber-500 hover:!bg-amber-600 !border-none"
              :loading="redeemLoading"
              :disabled="!canRedeem"
              @click="handleRedeem"
            />
            <p class="text-xs text-slate-500">Chọn gói rồi đổi, hệ thống sẽ tạo voucher riêng cho bạn.</p>

            <div v-if="lastRedeemedVoucher" class="p-3 border rounded-lg bg-amber-50 text-sm text-slate-800">
              <p class="font-semibold flex items-center gap-2">
                <i class="pi pi-ticket" />
                Voucher của bạn: <span class="text-amber-700">{{ lastRedeemedVoucher.code }}</span>
              </p>
              <p class="mt-1">Giảm {{ lastRedeemedVoucher.discount }}% cho đơn từ {{ formatCurrency(lastRedeemedVoucher.minOrderValue) }}. Hiệu lực {{ voucherValidDays }} ngày.</p>
              <Button
                size="small"
                label="Sao chép mã"
                icon="pi pi-copy"
                text
                @click="navigator.clipboard.writeText(lastRedeemedVoucher.code)"
              />
            </div>
            <div v-if="myVouchers.length" class="border rounded-lg p-3 space-y-2 bg-slate-50">
              <p class="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <i class="pi pi-ticket" /> Voucher cá nhân của bạn
              </p>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div
                  v-for="v in myVouchers"
                  :key="v._id || v.code"
                  class="p-2 border rounded flex items-center justify-between bg-white"
                >
                  <div>
                    <p class="font-semibold text-slate-900">{{ v.code }}</p>
                    <p class="text-xs text-slate-600">{{ formatVoucherDesc(v) }} | Đơn tối thiểu {{ formatCurrency(v.min_order_value) }}</p>
                    <p class="text-xs text-slate-500">HSD: {{ formatDate(v.valid_until as any) }}</p>
                  </div>
                  <Button size="small" label="Dùng" icon="pi pi-copy" text @click="navigator.clipboard.writeText(v.code)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Card class="mt-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Lịch sử tích/đổi điểm</h3>
            <p class="text-sm text-slate-500">Theo dõi chi tiết mọi hoạt động liên quan đến điểm thưởng của bạn.</p>
          </div>
          <div class="flex gap-2">
            <Dropdown
              v-model="historyLimit"
              :options="[5, 10, 20, 50]"
              :disabled="loadingHistory"
              placeholder="Số dòng"
              class="w-28"
            />
            <Button icon="pi pi-download" label="Xuất CSV" text @click="exportHistory" />
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="history"
          :rows="historyLimit"
          :total-records="historyTotal"
          paginator
          lazy
          :loading="loadingHistory"
          data-key="_id"
          current-page-report-template="Hiển thị {first} - {last} / {totalRecords} giao dịch"
          @page="onHistoryPage"
        >
          <Column field="created_at" header="Thời gian" sortable>
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column field="source" header="Nguồn" sortable>
            <template #body="{ data }">
              <Tag :value="translateSource(data.source)" :severity="sourceSeverity(data.source)" />
            </template>
          </Column>
          <Column field="description" header="Mô tả" />
          <Column field="points" header="Điểm" sortable>
            <template #body="{ data }">
              <span :class="data.points >= 0 ? 'text-green-600' : 'text-red-500'">
                {{ data.points >= 0 ? `+${data.points}` : data.points }}
              </span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { MemberService } from '~/packages/base/services/member.service';
import type { MemberCardModel } from '~/packages/base/models/dto/response/member/member-card.model';
import type { MemberPointHistoryModel } from '~/packages/base/models/dto/response/member/member-point-history.model';
import type { MembershipTierModel } from '~/packages/base/models/dto/response/member/membership-tier.model';
import { VoucherService } from '~/packages/base/services/voucher.service';
import type { VoucherModel } from '~/packages/base/models/dto/response/voucher/voucher.model';

definePageMeta({
  auth: true
});

const toast = useToast();
const card = ref<MemberCardModel | null>(null);
const loadingCard = ref(false);
const history = ref<MemberPointHistoryModel[]>([]);
const loadingHistory = ref(false);
const historyLimit = ref(10);
const historyPage = ref(0);
const historyTotal = ref(0);
const voucherValidDays = 30;
const redeemOptions = [
  { points: 50, discount: 8, minOrderValue: 100000 },
  { points: 100, discount: 18, minOrderValue: 100000 }
];
const selectedOption = ref<typeof redeemOptions[number] | null>(redeemOptions[0]);
const lastRedeemedVoucher = ref<{ code: string; discount: number; minOrderValue: number } | null>(null);
const myVouchers = ref<VoucherModel[]>([]);
const redeemForm = reactive({
  points: 0,
  reason: ''
});
const redeemLoading = ref(false);

const tierInfo = computed<MembershipTierModel | null>(() => {
  const tier = card.value?.tier_id;
  if (tier && typeof tier !== 'string') {
    return tier as MembershipTierModel;
  }
  return null;
});

const tierName = computed(() => tierInfo.value?.name || 'Thành viên');
const tierDescription = computed(() => tierInfo.value?.description || 'Hạng mặc định của bạn.');
const benefits = computed(() => tierInfo.value?.benefits || []);
const tierBadgeLabel = computed(() => `${tierName.value}`);
const canRedeem = computed(() => {
  if (!card.value || !selectedOption.value) return false;
  return selectedOption.value.points > 0 && selectedOption.value.points <= (card.value?.points_balance || 0);
});

const formatNumber = (value?: number) => (value ?? 0).toLocaleString('vi-VN');
const formatCurrency = (value?: number) => {
  const amount = value ?? 0;
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
const formatDate = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '';
const translateSource = (source: string) => {
  const map: Record<string, string> = {
    order: 'Đơn hàng',
    review: 'Đánh giá',
    redeem: 'Đổi điểm',
    manual: 'Thủ công',
    adjust: 'Điều chỉnh'
  };
  return map[source] || source;
};
const sourceSeverity = (source: string) => {
  const map: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
    order: 'success',
    review: 'info',
    redeem: 'warn',
    manual: 'info',
    adjust: 'danger'
  };
  return map[source] || 'info';
};

const selectOption = (option: typeof redeemOptions[number]) => {
  selectedOption.value = option;
  redeemForm.points = option.points;
  if (!redeemForm.reason) {
    redeemForm.reason = `Đổi voucher giảm ${option.discount}%`;
  }
};

const loadLastRedeemed = () => {
  try {
    const raw = localStorage.getItem('lastRedeemedVoucher');
    if (raw) {
      lastRedeemedVoucher.value = JSON.parse(raw);
    }
  } catch (error) {
    console.error('Không thể đọc cache voucher:', error);
  }
};

const saveLastRedeemed = () => {
  if (!lastRedeemedVoucher.value) return;
  localStorage.setItem('lastRedeemedVoucher', JSON.stringify(lastRedeemedVoucher.value));
};

const fetchMyVouchers = async () => {
  try {
    const data = await VoucherService.getMyVouchers();
    myVouchers.value = data || [];
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể tải voucher của bạn', life: 3000 });
  }
};

const formatVoucherDesc = (voucher: VoucherModel) => {
  if (!voucher) return '';
  const discountValue = Number(voucher.discount) || 0;
  if (voucher.discount_type === 'percentage') {
    const cap = voucher.max_discount ? ` (tối đa ${Number(voucher.max_discount).toLocaleString('vi-VN')}đ)` : '';
    return `Giảm ${discountValue}%${cap}`;
  }
  return `Giảm ${discountValue.toLocaleString('vi-VN')}đ`;
};

if (selectedOption.value) {
  redeemForm.points = selectedOption.value.points;
}

const fetchCard = async () => {
  try {
    loadingCard.value = true;
    card.value = await MemberService.getMyMemberCard();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể tải thẻ thành viên', life: 3000 });
  } finally {
    loadingCard.value = false;
  }
};

const fetchHistory = async () => {
  try {
    loadingHistory.value = true;
    const { data, pagination } = await MemberService.getMyPointHistory({ page: historyPage.value + 1, limit: historyLimit.value });
    history.value = data;
    historyTotal.value = pagination.total;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể tải lịch sử điểm', life: 3000 });
  } finally {
    loadingHistory.value = false;
  }
};

const handleRedeem = async () => {
  if (!canRedeem.value || redeemLoading.value || !selectedOption.value) return;
  try {
    redeemLoading.value = true;
    const response = await MemberService.redeemPoints({
      points: selectedOption.value.points,
      reason: redeemForm.reason || `Đổi voucher giảm ${selectedOption.value.discount}%`
    });
    const voucherCode = response?.data?.voucher?.code;
    if (voucherCode) {
      lastRedeemedVoucher.value = {
        code: voucherCode,
        discount: selectedOption.value.discount,
        minOrderValue: selectedOption.value.minOrderValue
      };
      saveLastRedeemed();
    }
    toast.add({
      severity: 'success',
      summary: 'Đổi điểm thành công',
      detail: voucherCode
        ? `Voucher ${voucherCode} giảm ${selectedOption.value.discount}% (đơn tối thiểu ${formatCurrency(selectedOption.value.minOrderValue)})`
        : 'Đã tạo voucher giảm giá',
      life: 4000
    });
    redeemForm.reason = '';
    await fetchCard();
    await fetchHistory();
    await fetchMyVouchers();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể đổi điểm', life: 3000 });
  } finally {
    redeemLoading.value = false;
  }
};

const onHistoryPage = (event: any) => {
  historyPage.value = event.page;
  historyLimit.value = event.rows;
  fetchHistory();
};

const refreshData = async () => {
  await Promise.all([fetchCard(), fetchHistory()]);
};

const exportHistory = () => {
  if (!history.value.length) {
    toast.add({ severity: 'warn', summary: 'Thông báo', detail: 'Không có dữ liệu để xuất', life: 2000 });
    return;
  }
  const header = 'Thời gian,Nguồn,Loại,Mô tả,Điểm';
  const rows = history.value.map((item) => {
    return [
      formatDate(item.created_at),
      translateSource(item.source),
      item.type,
      (item.description || '').replace(/,/g, ';'),
      item.points
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'lich-su-diem.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xuất lịch sử điểm', life: 2000 });
};

watch(historyLimit, () => {
  historyPage.value = 0;
  fetchHistory();
});

onMounted(() => {
  loadLastRedeemed();
  refreshData();
  fetchMyVouchers();
});

watch(lastRedeemedVoucher, saveLastRedeemed, { deep: true });
</script>
