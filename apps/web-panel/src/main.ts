import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import App from './App.vue';
import './style.css';
import { setupPwa } from './pwa';

const app = createApp(App);
const pinia = createPinia();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      gcTime: 30 * 60 * 1000,
      enabled: true,
      networkMode: 'online',
      refetchOnReconnect: true
    }
  }
});

app.use(VueQueryPlugin, { queryClient });
app.use(pinia);
setupPwa();
app.mount('#app');
