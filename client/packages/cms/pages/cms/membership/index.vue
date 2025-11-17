<template>
  <div class="p-card space-y-6">
    <ToolBar class="mb-4">
      <template #start>
        <div>
          <Breadcrumb
            :home="home"
            :model="items"
          >
            <template #item="{ item, props }">
              <router-link
                v-if="item.route"
                v-slot="{ href, navigate }"
                :to="item.route"
                custom
              >
                <a
                  :href="href"
                  v-bind="props.action"
                  @click="navigate"
                >
                  <span :class="[item.icon, 'text-color']" />
                  <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
              </router-link>
              <a
                v-else
                :href="item.url"
                :target="item.target"
                v-bind="props.action"
              >
                <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
              </a>
            </template>
          </Breadcrumb>
        </div>
      </template>
      <template #end>
        <Button icon="pi pi-refresh" label="Làm mới" class="mr-2" :loading="loadingCards || loadingTiers" @click="refreshAll" />
      </template>
    </ToolBar>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <template #title>Tổng số thẻ</template>
        <template #content>
          <p class="text-3xl font-bold text-primary">{{ stats?.totalCards ?? 0 }}</p>
          <p class="text-sm text-surface-500">Khách hàng đã được phát hành thẻ</p>
        </template>
      </Card>
      <Card>
        <template #title>Tổng điểm tích lũy</template>
        <template #content>
          <p class="text-3xl font-bold text-green-500">{{ totalPoints }}</p>
          <p class="text-sm text-surface-500">Điểm khả dụng trên toàn hệ thống</p>
        </template>
      </Card>
      <Card>
        <template #title>Tổng chi tiêu</template>
        <template #content>
          <p class="text-3xl font-bold text-amber-500">{{ formatCurrency(totalSpend) }}</p>
          <p class="text-sm text-surface-500">Lifetime spend của tất cả thành viên</p>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>Danh sách thẻ thành viên</template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Tìm kiếm</label>
            <IconField icon-position="left">
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText v-model="cardKeyword" placeholder="Tên, email, số điện thoại" class="w-full" @keyup.enter="applyCardFilter" />
            </IconField>
          </div>
          <div class="flex items-end gap-2">
            <Button icon="pi pi-filter" label="Lọc" class="w-full" @click="applyCardFilter" />
            <Button icon="pi pi-filter-slash" label="Bỏ lọc" severity="secondary" outlined class="w-full" @click="resetCardFilters" />
          </div>
        </div>

        <DataTable
          :value="memberCards"
          :rows="cardRows"
          :total-records="cardTotal"
          paginator
          lazy
          data-key="_id"
          :loading="loadingCards"
          current-page-report-template="Hiển thị {first} - {last} / {totalRecords} thẻ"
          @page="onCardPage"
        >
          <Column header="#">
            <template #body="{ index }">
              {{ index + 1 + cardPage * cardRows }}
            </template>
          </Column>
          <Column field="user_id.full_name" header="Khách hàng">
            <template #body="{ data }">
              <div>
                <p class="font-semibold">{{ resolveUserField(data, 'full_name') }}</p>
                <p class="text-xs text-surface-500">{{ resolveUserField(data, 'email') }}</p>
              </div>
            </template>
          </Column>
          <Column header="Điểm">
            <template #body="{ data }">
              <p class="font-semibold text-green-600">{{ formatNumber(data.points_balance) }}</p>
              <p class="text-xs text-surface-500">Lifetime: {{ formatNumber(data.lifetime_points) }}</p>
            </template>
          </Column>
          <Column header="Hạng">
            <template #body="{ data }">
              <Tag :value="resolveTier(data)?.name || 'Chưa phân hạng'" />
            </template>
          </Column>
          <Column header="Cập nhật">
            <template #body="{ data }">
              {{ formatDate(data.updated_at) }}
            </template>
          </Column>
          <Column header="" body-style="text-align:right" style="width: 200px">
            <template #body="{ data }">
              <div class="flex justify-end gap-2">
                <Button icon="pi pi-pencil" label="Điều chỉnh" size="small" outlined @click="openAdjustDialog(data)" />
                <Button icon="pi pi-shield" size="small" outlined severity="info" @click="triggerTier(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Card>
      <template #title>Quản lý hạng thẻ</template>
      <template #content>
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="text-sm text-surface-500">Định nghĩa ngưỡng điểm và ưu đãi cho từng hạng.</p>
          </div>
          <Button label="Thêm hạng" icon="pi pi-plus" @click="openTierDialog()" />
        </div>
        <DataTable :value="tiers" :loading="loadingTiers" data-key="_id">
          <Column field="name" header="Tên hạng" />
          <Column field="min_points" header="Điểm tối thiểu">
            <template #body="{ data }">{{ formatNumber(data.min_points) }}</template>
          </Column>
          <Column field="discount_rate" header="Ưu đãi">
            <template #body="{ data }">{{ data.discount_rate }}%</template>
          </Column>
          <Column field="priority" header="Thứ tự" />
          <Column field="is_active" header="Trạng thái">
            <template #body="{ data }">
              <Tag :severity="data.is_active ? 'success' : 'danger'" :value="data.is_active ? 'Hoạt động' : 'Tạm khóa'" />
            </template>
          </Column>
          <Column header="" body-style="text-align:right">
            <template #body="{ data }">
              <div class="flex justify-end gap-2">
                <Button icon="pi pi-pencil" rounded text @click="openTierDialog(data)" />
                <Button icon="pi pi-trash" rounded text severity="danger" @click="deleteTier(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="adjustDialog.visible" modal header="Điều chỉnh điểm" :style="{ width: '480px' }" @hide="resetAdjustDialog">
      <div class="space-y-4">
        <div>
          <p class="text-sm text-surface-500">Khách hàng</p>
          <p class="font-semibold">{{ adjustDialog.memberLabel }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Giá trị điều chỉnh</label>
          <InputNumber v-model="adjustDialog.delta" show-buttons :min="-100000" :max="100000" class="w-full" />
          <small class="text-surface-500">Điểm có thể âm để trừ, dương để cộng.</small>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Ghi chú</label>
          <InputTextarea v-model="adjustDialog.reason" rows="3" class="w-full" placeholder="Lý do điều chỉnh" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Hủy" outlined @click="adjustDialog.visible = false" />
          <Button label="Lưu" icon="pi pi-check" :loading="adjustDialog.loading" @click="submitAdjust" />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="tierDialog.visible" modal :header="tierDialog.isEdit ? 'Cập nhật hạng' : 'Thêm hạng mới'" :style="{ width: '520px' }" @hide="resetTierDialog">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Tên hạng</label>
            <InputText v-model="tierDialog.form.name" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Thứ tự ưu tiên</label>
            <InputNumber v-model="tierDialog.form.priority" class="w-full" :min="1" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Điểm tối thiểu</label>
            <InputNumber v-model="tierDialog.form.min_points" class="w-full" :min="0" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ưu đãi (%)</label>
            <InputNumber v-model="tierDialog.form.discount_rate" class="w-full" :min="0" :max="100" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Chi tiêu tối thiểu</label>
            <InputNumber v-model="tierDialog.form.min_lifetime_spend" class="w-full" :min="0" />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="tierDialog.form.is_active" :binary="true" />
            <label>Kích hoạt</label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Mô tả</label>
          <InputTextarea v-model="tierDialog.form.description" rows="2" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Lợi ích (mỗi dòng một lợi ích)</label>
          <InputTextarea v-model="tierDialog.benefitsText" rows="4" class="w-full" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Hủy" outlined @click="tierDialog.visible = false" />
          <Button label="Lưu" icon="pi pi-check" :loading="tierDialog.loading" @click="submitTier" />
        </div>
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { MemberService } from '~/packages/base/services/member.service';
import type { MemberCardWithUser } from '~/packages/base/models/dto/response/member/member-card-with-user.model';
import type { MembershipTierModel } from '~/packages/base/models/dto/response/member/membership-tier.model';


definePageMeta({ layout: 'cms-default' });
// const home = ref({
//     icon: 'pi pi-home',
//     route: '/cms',
//   });
  
const toast = useToast();
const memberCards = ref<MemberCardWithUser[]>([]);
const cardPage = ref(0);
const cardRows = ref(10);
const cardTotal = ref(0);
const cardKeyword = ref('');
const loadingCards = ref(false);
const loadingTiers = ref(false);
const tiers = ref<MembershipTierModel[]>([]);
const stats = ref<{ totalCards: number; byTier: Array<{ _id: string; totalMembers: number; totalPoints: number; lifetimeSpend: number }> } | null>(null);

const home = ref({ icon: 'pi pi-home', route: '/cms' });
const items = ref([
  { label: 'Hệ thống' }, { label: 'Quản lý thẻ thành viên', icon: 'pi pi-card' }
]);
const adjustDialog = reactive({
  visible: false,
  memberId: '',
  memberLabel: '',
  delta: 0,
  reason: '',
  loading: false
});

const tierDialog = reactive({
  visible: false,
  isEdit: false,
  targetId: '',
  benefitsText: '',
  loading: false,
  form: {
    name: '',
    description: '',
    min_points: 0,
    min_lifetime_spend: 0,
    discount_rate: 0,
    benefits: [] as string[],
    priority: 1,
    is_active: true
  }
});

const totalPoints = computed(() => stats.value?.byTier?.reduce((sum, row) => sum + (row.totalPoints || 0), 0) ?? 0);
const totalSpend = computed(() => stats.value?.byTier?.reduce((sum, row) => sum + (row.lifetimeSpend || 0), 0) ?? 0);

const formatNumber = (value?: number) => (value ?? 0).toLocaleString('vi-VN');
const formatCurrency = (value?: number) => (value ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const formatDate = (value?: string) => value ? new Date(value).toLocaleString('vi-VN') : '';

const resolveUserField = (card: MemberCardWithUser, field: 'full_name' | 'email' | 'phone') => {
  if (card.user_id && typeof card.user_id !== 'string') {
    return card.user_id[field] || '—';
  }
  return '—';
};

const resolveTier = (card: MemberCardWithUser) => {
  if (card.tier_id && typeof card.tier_id !== 'string') {
    return card.tier_id as MembershipTierModel;
  }
  return null;
};

const fetchCards = async () => {
  try {
    loadingCards.value = true;
    const response = await MemberService.listMemberCards({
      page: cardPage.value + 1,
      limit: cardRows.value,
      keyword: cardKeyword.value.trim() || undefined
    });
    memberCards.value = response?.data ?? [];
    cardTotal.value = response?.pagination?.total ?? memberCards.value.length;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể tải danh sách thẻ', life: 3000 });
  } finally {
    loadingCards.value = false;
  }
};

const applyCardFilter = () => {
  cardPage.value = 0;
  fetchCards();
};

const onCardPage = (event: any) => {
  cardPage.value = event.page;
  cardRows.value = event.rows;
  fetchCards();
};

const resetCardFilters = () => {
  cardKeyword.value = '';
  cardPage.value = 0;
  fetchCards();
};

const fetchTiers = async () => {
  try {
    loadingTiers.value = true;
    tiers.value = await MemberService.getTiers();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể tải hạng thẻ', life: 3000 });
  } finally {
    loadingTiers.value = false;
  }
};

const fetchStats = async () => {
  try {
    stats.value = await MemberService.getStats();
  } catch (error) {
    console.error(error);
  }
};

const openAdjustDialog = (card: MemberCardWithUser) => {
  adjustDialog.visible = true;
  adjustDialog.memberId = typeof card.user_id === 'string' ? card.user_id : card.user_id?._id || '';
  adjustDialog.memberLabel = resolveUserField(card, 'full_name') || resolveUserField(card, 'email');
  adjustDialog.delta = 0;
  adjustDialog.reason = '';
};

const resetAdjustDialog = () => {
  adjustDialog.memberId = '';
  adjustDialog.memberLabel = '';
  adjustDialog.delta = 0;
  adjustDialog.reason = '';
  adjustDialog.loading = false;
};

const submitAdjust = async () => {
  if (!adjustDialog.memberId || !adjustDialog.delta) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập giá trị điểm', life: 2000 });
    return;
  }
  try {
    adjustDialog.loading = true;
    await MemberService.adjustPoints({
      user_id: adjustDialog.memberId,
      delta_points: adjustDialog.delta,
      reason: adjustDialog.reason
    });
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã điều chỉnh điểm', life: 3000 });
    adjustDialog.visible = false;
    await Promise.all([fetchCards(), fetchStats()]);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể điều chỉnh điểm', life: 3000 });
  } finally {
    adjustDialog.loading = false;
  }
};

const triggerTier = async (card: MemberCardWithUser) => {
  const userId = typeof card.user_id === 'string' ? card.user_id : card.user_id?._id || '';
  if (!userId) return;
  try {
    await MemberService.triggerTierCheck(userId);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã kiểm tra lại hạng thẻ', life: 2000 });
    fetchCards();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể kiểm tra hạng', life: 3000 });
  }
};

const openTierDialog = (tier?: MembershipTierModel) => {
  tierDialog.visible = true;
  tierDialog.isEdit = !!tier;
  tierDialog.targetId = tier?._id || '';
  tierDialog.form = {
    name: tier?.name || '',
    description: tier?.description || '',
    min_points: tier?.min_points || 0,
    min_lifetime_spend: tier?.min_lifetime_spend || 0,
    discount_rate: tier?.discount_rate || 0,
    benefits: tier?.benefits || [],
    priority: tier?.priority || 1,
    is_active: tier?.is_active ?? true
  };
  tierDialog.benefitsText = (tier?.benefits || []).join('\n');
};

const resetTierDialog = () => {
  tierDialog.targetId = '';
  tierDialog.visible = false;
  tierDialog.isEdit = false;
  tierDialog.form = {
    name: '',
    description: '',
    min_points: 0,
    min_lifetime_spend: 0,
    discount_rate: 0,
    benefits: [],
    priority: 1,
    is_active: true
  };
  tierDialog.benefitsText = '';
  tierDialog.loading = false;
};

const submitTier = async () => {
  if (!tierDialog.form.name) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập tên hạng', life: 2000 });
    return;
  }
  try {
    tierDialog.loading = true;
    const payload = {
      ...tierDialog.form,
      benefits: tierDialog.benefitsText
        .split('\n')
        .map((text) => text.trim())
        .filter(Boolean)
    };
    if (tierDialog.isEdit && tierDialog.targetId) {
      await MemberService.updateTier(tierDialog.targetId, payload);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật hạng', life: 3000 });
    } else {
      await MemberService.createTier(payload);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo hạng mới', life: 3000 });
    }
    tierDialog.visible = false;
    await fetchTiers();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể lưu hạng', life: 3000 });
  } finally {
    tierDialog.loading = false;
  }
};

const deleteTier = async (tier: MembershipTierModel) => {
  if (!confirm(`Xác nhận xóa hạng "${tier.name}"?`)) return;
  try {
    await MemberService.deleteTier(tier._id);
    toast.add({ severity: 'success', summary: 'Đã xóa', detail: 'Hạng đã được xóa', life: 2000 });
    fetchTiers();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.message || 'Không thể xóa hạng', life: 3000 });
  }
};

const refreshAll = async () => {
  await Promise.all([fetchCards(), fetchTiers(), fetchStats()]);
};

onMounted(() => {
  refreshAll();
});
</script>
