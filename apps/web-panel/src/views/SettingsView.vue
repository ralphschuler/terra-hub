<template>
  <div class="flex flex-col gap-4">
    <section class="glass-panel p-4 sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm uppercase tracking-wide text-brand-200/80">First-time setup</p>
          <h2 class="text-xl font-semibold">Configure your controller</h2>
          <p class="mt-1 text-sm text-slate-300">
            Connect to the controller's setup network, open this page, and provide your Wi-Fi credentials so the ESP can join
            your home network. The rules engine and triggers stay on-device; the web app is just a remote control.
          </p>
        </div>
        <div class="flex gap-2 text-xs">
          <span class="badge" :class="config?.stationConnected ? 'badge-success' : 'badge-warn'">
            <span class="h-2 w-2 rounded-full" :class="config?.stationConnected ? 'bg-emerald-400' : 'bg-amber-400'" />
            {{ config?.stationConnected ? 'Wi-Fi connected' : 'Awaiting Wi-Fi' }}
          </span>
          <span class="badge-muted">AP: {{ config?.apSsid || 'TerraHub-Setup' }}</span>
        </div>
      </div>
      <div class="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p class="font-semibold text-slate-100">How to provision</p>
          <ol class="mt-2 list-decimal space-y-2 pl-4">
            <li>Power on the controller. It will broadcast <strong>{{ config?.apSsid || 'TerraHub-Setup' }}</strong>.</li>
            <li>Connect to that Wi-Fi using password <strong>{{ config?.apPassword || 'terra-hub' }}</strong>.</li>
            <li>Open <code class="rounded bg-slate-800 px-2 py-1">{{ config?.apIp || 'http://192.168.4.1' }}</code> to load this app.</li>
            <li>Enter your Wi-Fi credentials below and save. The ESP will reconnect automatically.</li>
          </ol>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p class="font-semibold text-slate-100">Current status</p>
          <ul class="mt-2 space-y-2">
            <li class="flex items-center justify-between">
              <span class="text-slate-400">Station SSID</span>
              <span class="font-medium">{{ config?.stationSsid || 'Not configured' }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="text-slate-400">Station IP</span>
              <span class="font-medium">{{ config?.stationIp || '—' }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="text-slate-400">Hostname</span>
              <span class="font-medium">{{ config?.hostname || 'terrahub' }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="text-slate-400">AP IP</span>
              <span class="font-medium">{{ config?.apIp || '192.168.4.1' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="glass-panel p-4 sm:p-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm uppercase tracking-wide text-brand-200/80">Wi-Fi</p>
          <h3 class="text-lg font-semibold">Join your home network</h3>
          <p class="text-sm text-slate-300">Save credentials so the controller can come online without the setup AP.</p>
        </div>
        <div v-if="mutation.isSuccess" class="badge badge-success">Saved</div>
      </div>

      <form class="mt-4 space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-medium text-slate-100">
            Wi-Fi SSID
            <input v-model="wifiForm.ssid" type="text" class="input-field mt-1" placeholder="Home Wi-Fi" required />
          </label>
          <label class="block text-sm font-medium text-slate-100">
            Wi-Fi Password
            <input v-model="wifiForm.password" type="password" class="input-field mt-1" placeholder="••••••••" required />
          </label>
        </div>
        <label class="block text-sm font-medium text-slate-100">
          Hostname (optional)
          <input v-model="wifiForm.hostname" type="text" class="input-field mt-1" placeholder="terrahub" />
        </label>

        <div class="flex flex-wrap gap-2 text-sm text-slate-300">
          <span class="badge-muted">AP: {{ config?.apSsid || 'TerraHub-Setup' }}</span>
          <span class="badge-muted">Setup password: {{ config?.apPassword || 'terra-hub' }}</span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-400">
            The controller keeps its setup AP active so you can recover if home Wi-Fi is unavailable.
          </p>
          <button class="button-primary w-full sm:w-auto" :disabled="mutation.isLoading || configLoading" type="submit">
            <span v-if="mutation.isLoading">Saving…</span>
            <span v-else>Save & reconnect</span>
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { fetchDeviceConfig, updateWifiConfig } from '../api/config';
import type { DeviceConfig } from '../types';

const queryClient = useQueryClient();

const wifiForm = reactive({
  ssid: '',
  password: '',
  hostname: ''
});

const { data: config, isLoading: configLoading } = useQuery<DeviceConfig>({
  queryKey: ['device-config'],
  queryFn: fetchDeviceConfig,
  staleTime: 10_000
});

watch(
  () => config?.value,
  (next) => {
    if (next) {
      wifiForm.ssid = next.stationSsid || wifiForm.ssid;
      wifiForm.hostname = next.hostname || wifiForm.hostname || 'terrahub';
    }
  },
  { immediate: true }
);

const mutation = useMutation({
  mutationFn: updateWifiConfig,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['device-config'] });
  }
});

const handleSubmit = () => {
  mutation.mutate({
    ssid: wifiForm.ssid,
    password: wifiForm.password,
    hostname: wifiForm.hostname
  });
};
</script>
