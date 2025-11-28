<template>
  <div class="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
    <div class="flex items-start gap-3">
      <div class="rounded-xl bg-brand-500/10 p-3 text-brand-200">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m9-9H3" />
        </svg>
      </div>
      <div class="space-y-1 text-sm">
        <p class="text-xs uppercase tracking-wide text-brand-200/80">Progressive Web App</p>
        <h3 class="text-lg font-semibold">Install for quick access</h3>
        <p class="text-slate-300">
          Use the browser's install or add-to-home-screen action to pin TerraHub to your mobile device. Updates install
          automatically.
        </p>
        <div class="flex flex-wrap gap-2" v-if="needRefresh">
          <button class="button-primary" @click="updateServiceWorker()">Update now</button>
          <button class="button-ghost" @click="close">Dismiss</button>
        </div>
        <p v-else class="text-xs text-emerald-300" v-if="offlineReady">Offline cache ready</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true });

const close = () => {
  offlineReady.value = false;
  needRefresh.value = false;
};
</script>
