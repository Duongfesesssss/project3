const layoutState = reactive({
  activeMenuSp: false,
  windowWidth: 0,
});

const windowWidth = ref<number>(window?.innerWidth ?? 0);
layoutState.windowWidth = windowWidth.value;
const onResize = () => {
  windowWidth.value = window.innerWidth;
  layoutState.windowWidth = windowWidth.value;
};
window?.addEventListener('resize', onResize);
export function useMainLayout() {
  const toggleMenuSp = () => {
    layoutState.activeMenuSp = !layoutState.activeMenuSp;
  };

  const doCheckSp = () => {
    if (windowWidth.value < 600) {
      document.body.classList.add('device_sp');
    }
    else {
      document.body.classList.remove('device_sp');
    }
  };

  const isMenuSpActive = computed(() => layoutState.activeMenuSp);
  const isMobileSp = computed(() => layoutState.windowWidth <= 1020);
  const getWindowWidth = computed(() => layoutState.windowWidth);

  return { layoutState: readonly(layoutState), toggleMenuSp, isMenuSpActive, getWindowWidth, doCheckSp, isMobileSp };
}
