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
            <div>
              <label class="block text-sm font-medium mb-1">Số điểm muốn dùng</label>
              <InputNumber
                v-model="redeemForm.points"
                show-buttons
                :min="0"
                :max="card?.points_balance || 0"
                :disabled="redeemLoading || !card"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Ghi chú</label>
              <InputText v-model="redeemForm.reason" placeholder="Ví dụ: Đổi voucher 50K" :disabled="redeemLoading" class="w-full" />
            </div>
            <Button
              label="Đổi điểm"
              icon="pi pi-gift"
              class="w-full !bg-amber-500 hover:!bg-amber-600 !border-none"
              :loading="redeemLoading"
              :disabled="!canRedeem"
              @click="handleRedeem"
            />
            <p class="text-xs text-slate-500">Điểm sử dụng sẽ được trừ ngay khỏi số dư hiện tại.</p>
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
const canRedeem = computed(() => !!card.value && !!redeemForm.points && redeemForm.points > 0 && redeemForm.points <= (card.value?.points_balance || 0));

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
  if (!canRedeem.value || redeemLoading.value) return;
  try {
    redeemLoading.value = true;
    await MemberService.redeemPoints({
      points: redeemForm.points,
      reason: redeemForm.reason
    });
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đổi điểm thành công', life: 3000 });
    redeemForm.points = 0;
    redeemForm.reason = '';
    await fetchCard();
    await fetchHistory();
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
  refreshData();
});
</script>
