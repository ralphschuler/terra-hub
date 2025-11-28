<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Controllers</h2>
      <p class="text-sm text-slate-400">Active list combines manual entries and discovered devices.</p>
    </div>

    <div
      v-if="!orderedControllers.length"
      class="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300"
    >
      Add a controller manually or use discovery to populate this list.
    </div>

    <div class="card-grid">
      <ControllerCard
        v-for="controller in orderedControllers"
        :key="controllerKey(controller)"
        :controller="controller"
        @remove="removeController"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import ControllerCard from './ControllerCard.vue';
import { useControllerStore } from '../stores/controllerStore';
import type { ControllerSummary } from '../types';

const controllerStore = useControllerStore();
const { controllers } = storeToRefs(controllerStore);
const { removeController } = controllerStore;

const controllerKey = (controller: ControllerSummary) => `${controller.host}:${controller.port}`;

const orderedControllers = computed(() =>
  [...controllers.value].sort((a, b) => Number(Boolean(b.discovered)) - Number(Boolean(a.discovered)))
);
</script>
