<script setup lang="ts">
const { isMenuSpActive, toggleMenuSp, isMobileSp } = useMainLayout();
</script>

<template>
  <div class="header-wrap">
    <header id="header">
      <div class="logo">
        <h1>
          <span>Hệ Thống Giám Sát Thiên Tai Tỉnh Quảng Ninh</span>
        </h1>
      </div>
      <div class="header-main">
        <div class="header-main-inner">
          <SharedNavTop v-if="!isMobileSp" />
          <div id="menu-sp-btn">
            <a
              href="javascript:;"
              class="sma_menu_open"
              :class="isMenuSpActive ? 'active' : ''"
              @click="
                () => {
                  toggleMenuSp();
                }
              "
            >
              <span class="menu_icon" />
            </a>
          </div>
        </div>
      </div>
    </header>
    <!-- end header -->
    <div class="front-top">
      <SharedNav v-if="!isMobileSp" />
    </div>
    <!-- end menu -->
  </div>
  <!-- end header-wrap -->
</template>
