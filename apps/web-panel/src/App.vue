<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950/90 to-slate-950 text-slate-100">
    <header class="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 ring-2 ring-brand-500/50">
            <svg class="h-6 w-6 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 7.5C4.5 6.5 6.2 6 8 6c3.7 0 4.3 1.5 8 1.5S20.3 6 24 6" />
            </svg>
          </div>
          <div>
            <p class="text-sm uppercase tracking-wide text-brand-200/80">TerraHub</p>
            <h1 class="text-xl font-bold">Controller Web Panel</h1>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <nav class="flex gap-2 text-sm">
            <button
              class="button-ghost"
              :class="activeTab === 'dashboard' ? 'border-brand-400 text-white' : ''"
              type="button"
              @click="activeTab = 'dashboard'"
            >
              Dashboard
            </button>
            <button
              class="button-ghost"
              :class="activeTab === 'settings' ? 'border-brand-400 text-white' : ''"
              type="button"
              @click="activeTab = 'settings'"
            >
              Settings
            </button>
          </nav>
          <span class="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-600/50">
            PWA Ready
          </span>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-4">
      <section v-if="activeTab === 'dashboard'" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="glass-panel col-span-2 p-4 sm:p-6">
          <DashboardView />
        </article>
        <aside class="glass-panel p-4 sm:p-6">
          <PwaPrompt />
          <div class="mt-4">
            <ControllerForm />
          </div>
        </aside>
      </section>

      <section v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="col-span-2">
          <SettingsView />
        </article>
        <aside class="glass-panel p-4 sm:p-6">
          <PwaPrompt />
          <div class="mt-4">
            <ControllerForm />
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ControllerForm from './components/ControllerForm.vue';
import PwaPrompt from './components/PwaPrompt.vue';
import DashboardView from './views/DashboardView.vue';
import SettingsView from './views/SettingsView.vue';

const activeTab = ref<'dashboard' | 'settings'>('dashboard');
</script>
