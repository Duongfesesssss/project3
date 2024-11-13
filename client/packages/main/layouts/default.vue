<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'main-theme',
  },
  bodyAttrs: {
    class: 'define-top define-fixed',
  },
});

const { isMenuSpActive, toggleMenuSp, isMobileSp, doCheckSp } = useMainLayout();
onMounted(() => {
  doCheckSp();
});
window?.addEventListener('resize', () => {
  doCheckSp();
});


const items = ref([
  {
      label: 'Trang chủ',
      icon: 'pi pi-home'
  },
  {
      label: 'Features',
      icon: 'pi pi-star'
  },
  {
      label: 'Projects',
      icon: 'pi pi-search',
      items: [
          {
              label: 'Components',
              icon: 'pi pi-bolt'
          },
          {
              label: 'Blocks',
              icon: 'pi pi-server'
          },
          {
              label: 'UI Kit',
              icon: 'pi pi-pencil'
          },
          {
              label: 'Templates',
              icon: 'pi pi-palette',
              items: [
                  {
                      label: 'Apollo',
                      icon: 'pi pi-palette'
                  },
                  {
                      label: 'Ultima',
                      icon: 'pi pi-palette'
                  }
              ]
          }
      ]
  },
  {
      label: 'Contact',
      icon: 'pi pi-envelope'
  }
]);
</script>

<template>
  <div
    style="height:700px"
    id="wrapper"
    :class="isMenuSpActive ? 'menu-sp-open menu-sp' : ''"
  >
    <NuxtLoadingIndicator />
    <SharedHeader />
    <main
      id="page-content"
      class="layout-equal"
    >
      <Toast />
      <ConfirmDialog
        class="w-auto"
        group="templateConfirmDialog"
      >
        <template #message="slotProps">
          <div class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
            <i
              :class="slotProps.message.icon"
              class="!text-6xl text-neutral-500 pt-2"
            />
            <p>{{ slotProps.message.message }}</p>
          </div>
        </template>
      </ConfirmDialog>
      <DynamicDialog />
      <NuxtPage />
    </main>
    <!-- end page-content -->
    <SharedMainFooter />
    <div id="sub-menu-sp">
      <div
        id="smartphone-menu"
        class="wrap-sma"
        :class="isMenuSpActive ? 'active d-block' : 'd-none'"
      >
        <div id="sma-navi">
          <SharedNavTop
            v-if="isMobileSp"
          />
          <SharedNav
            v-if="isMobileSp"
          />
        </div>
        <div class="menu-sp-close">
          <a
            href="javascript:;;"
            @click="toggleMenuSp()"
          >
            <span></span>
          </a>
        </div>
      </div>
    </div>
    <!-- end sub-menu-sp -->
  </div>

  <div class="card" style="height: 80px; background-color: brown;">
      <Menubar :model="items" />
  </div>
  <!-- end wrapper -->
</template>

<style lang="scss">


</style>




