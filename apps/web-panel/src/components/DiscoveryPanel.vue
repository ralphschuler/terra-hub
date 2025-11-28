<template>
  <div class="glass-panel p-4 sm:p-5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-xs uppercase tracking-wide text-brand-200/80">Network discovery</p>
        <h2 class="text-lg font-semibold">Auto-discovered controllers</h2>
        <p class="text-sm text-slate-400">Scan your subnet (unicast-friendly) and quickly add devices.</p>
      </div>
      <button class="button-ghost" @click="refetch" :disabled="isFetching">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0 0 19 5" />
        </svg>
        Rescan
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <div v-if="isFetching" class="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm text-slate-300">
        Searching for controllers...
      </div>
      <div v-else-if="error" class="rounded-xl border border-amber-700/50 bg-amber-900/40 px-4 py-3 text-sm text-amber-100">
        {{ (error as Error).message || 'Unable to discover controllers' }}
      </div>
      <div v-else-if="!controllers?.length" class="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm text-slate-300">
        No controllers found on the network yet.
      </div>
      <div v-else class="space-y-3">
        <div v-for="controller in controllers" :key="controllerKey(controller)" class="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
          <div>
            <p class="text-sm font-semibold">{{ controller.name }}</p>
            <p class="text-xs text-slate-400">{{ controller.protocol?.toUpperCase() }} · {{ controller.host }}:{{ controller.port }}</p>
          </div>
          <button class="button-primary" @click="add(controller)">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
            </svg>
            Pin
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { discoverControllers } from '../api/controllers';
import { useControllerStore } from '../stores/controllerStore';
import type { ControllerSummary } from '../types';

const controllerStore = useControllerStore();

const controllerKey = (controller: ControllerSummary) => `${controller.host}:${controller.port}`;

const { data, isFetching, error, refetch } = useQuery({
  queryKey: ['controller-discovery'],
  queryFn: discoverControllers,
  refetchInterval: 30_000
});

const controllers = data;

watch(
  () => controllers.value,
  (next) => {
    if (next) controllerStore.setDiscoveredControllers(next);
  },
  { immediate: true }
);

const add = (controller: ControllerSummary) => {
  controllerStore.addController({ ...controller, discovered: false });
};
</script>
