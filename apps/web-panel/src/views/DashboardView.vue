<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-wide text-brand-200/80">Overview</p>
        <h2 class="text-2xl font-bold">Controllers</h2>
        <p class="text-sm text-slate-400">Monitor multiple controllers, whether discovered via unicast or added manually.</p>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-300">
        <span class="h-2 w-2 rounded-full bg-emerald-400" /> Live polling
      </div>
    </div>

    <DiscoveryPanel />

    <ControllerList />
  </div>
</template>

<script setup lang="ts">
import ControllerList from '../components/ControllerList.vue';
import DiscoveryPanel from '../components/DiscoveryPanel.vue';
</script>
