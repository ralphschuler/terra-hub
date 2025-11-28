<template>
  <div>
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-brand-200/80">Manual entry</p>
        <h2 class="text-lg font-semibold">Add a controller</h2>
        <p class="text-sm text-slate-400">Pin IP-based controllers or gateways by host and port.</p>
      </div>
      <span class="badge-muted">Multi-controller</span>
    </div>

    <form class="mt-4 space-y-3" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-2 sm:flex-row">
        <label class="w-full text-sm">
          <span class="text-slate-400">Host or IP</span>
          <input v-model="form.host" class="input-field" placeholder="192.168.0.42" required />
        </label>
        <label class="w-full text-sm sm:max-w-[120px]">
          <span class="text-slate-400">Port</span>
          <input v-model.number="form.port" class="input-field" min="1" max="65535" type="number" required />
        </label>
      </div>
      <label class="block text-sm">
        <span class="text-slate-400">Label</span>
        <input v-model="form.name" class="input-field" placeholder="Terrarium North" />
      </label>
      <label class="block text-sm">
        <span class="text-slate-400">Protocol</span>
        <select v-model="form.protocol" class="input-field">
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
          <option value="udp">UDP</option>
        </select>
      </label>
      <button type="submit" class="button-primary w-full" :disabled="!form.host || !form.port">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4 10-10" />
        </svg>
        Save Controller
      </button>
    </form>

    <div class="mt-6 rounded-2xl border border-brand-500/40 bg-brand-500/10 p-4 text-sm text-slate-200">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-brand-200/80">No hardware nearby?</p>
          <p class="text-base font-semibold">Use the built-in simulator</p>
          <p class="mt-1 text-slate-300">Spin up UI flows without physical controllers. The simulator returns live mock sensor data.</p>
        </div>
        <span class="badge-muted">Simulator</span>
      </div>
      <button class="button-primary mt-3 w-full" :disabled="hasSimulator" @click="addSimulator">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
        </svg>
        {{ hasSimulator ? 'Simulator added' : 'Add simulator controller' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useControllerStore } from '../stores/controllerStore';
import type { ControllerProtocol } from '../types';
import { SIMULATOR_CONTROLLER } from '../api/simulator';

const controllerStore = useControllerStore();
const { controllers } = storeToRefs(controllerStore);
const controllerKey = (controller: { host: string; port: number }) => `${controller.host}:${controller.port}`;

const form = reactive({
  name: '',
  host: '',
  port: 8080,
  protocol: 'http' as ControllerProtocol
});

const hasSimulator = computed(() =>
  controllers.value.some((controller) => controllerKey(controller) === controllerKey(SIMULATOR_CONTROLLER))
);

const addSimulator = () => {
  controllerStore.addController(SIMULATOR_CONTROLLER);
};

const handleSubmit = () => {
  if (!form.host || !form.port) return;
  controllerStore.addController({
    name: form.name || form.host,
    host: form.host.trim(),
    port: Number(form.port),
    protocol: form.protocol,
    discovered: false
  });
  form.name = '';
  form.host = '';
  form.port = 8080;
  form.protocol = 'http';
};
</script>
