import { useRegisterSW } from 'virtual:pwa-register/vue';

export const setupPwa = () => {
  if (typeof window === 'undefined') return;

  useRegisterSW({
    immediate: true,
    onRegistered(r) {
      r && r.update();
    }
  });
};
