<template>
  <div class="glass-panel h-full p-4">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-xs uppercase tracking-wide text-brand-200/80">{{ controller.protocol?.toUpperCase() }} · {{ endpoint }}</p>
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold">{{ controller.name }}</h3>
          <span class="badge-muted">{{ controllerKind }}</span>
        </div>
      </div>
      <span :class="badgeClass">{{ statusLabel }}</span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
      <span class="metric-pill" v-if="status?.lastSeen">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 5 5L20 7" />
        </svg>
        Seen {{ formatRelative(status.lastSeen) }}
      </span>
      <span class="metric-pill" v-if="status?.temperatureC !== undefined">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v9m0 0a3 3 0 1 1-3 3" />
        </svg>
        {{ status.temperatureC.toFixed(1) }}°C
      </span>
      <span class="metric-pill" v-if="status?.humidityPercent !== undefined">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3C9.8 7.2 8 9.6 8 12a4 4 0 0 0 8 0c0-2.4-1.8-4.8-4-9Z" />
        </svg>
        {{ status.humidityPercent.toFixed(1) }}%
      </span>
      <span class="metric-pill" v-if="status?.lightLevelLux !== undefined">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v2m4.95-1.05L15.7 6.2M20 12h-2M17 17l-1.76-1.76M12 20v-2M7 17l1.76-1.76M4 12h2M7 7l1.76 1.76" />
        </svg>
        {{ status.lightLevelLux.toFixed(0) }} lux
      </span>
    </div>

    <div class="mt-4 flex items-center justify-between gap-2 text-sm text-slate-300">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full" :class="status?.online ? 'bg-emerald-400' : 'bg-amber-400'" />
        <span>{{ status?.message || (status?.online ? 'Healthy connection' : 'Waiting for response') }}</span>
      </div>
      <div class="flex gap-2">
        <button class="button-ghost" @click="emitRemove(controller)">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-9 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
          </svg>
          Remove
        </button>
        <button class="button-ghost" @click="refetch" :disabled="isFetching">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0 0 19 5" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { fetchControllerStatus } from '../api/controllers';
import type { ControllerStatus, ControllerSummary } from '../types';

const props = defineProps<{ controller: ControllerSummary }>();
const emit = defineEmits<{ (e: 'remove', controller: ControllerSummary): void }>();

const endpoint = computed(() => `${props.controller.host}:${props.controller.port}`);
const controllerKind = computed(() => {
  if (props.controller.kind === 'simulator') return 'Simulator';
  return props.controller.discovered ? 'Discovered' : 'Pinned';
});

const emitRemove = (controller: ControllerSummary) => emit('remove', controller);

const { data: status, isFetching, refetch } = useQuery<ControllerStatus>({
  queryKey: ['controller-status', props.controller.host, props.controller.port],
  queryFn: () => fetchControllerStatus(props.controller),
  refetchInterval: 10_000
});

const statusLabel = computed(() => {
  if (status.value?.online) return 'Online';
  if (status.value) return 'Offline';
  return 'Checking';
});

const badgeClass = computed(() => {
  if (status.value?.online) return 'badge-success';
  if (status.value) return 'badge-warn';
  return 'badge-muted';
});

const formatRelative = (timestamp?: string) => {
  if (!timestamp) return 'n/a';
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};
</script>
