import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { ControllerSummary } from '../types';
import { SIMULATOR_CONTROLLER } from '../api/simulator';

const controllerKey = (controller: ControllerSummary) => `${controller.host}:${controller.port}`;
const STORAGE_KEY = 'terra-hub/controllers';

export const useControllerStore = defineStore('controllers', () => {
  const controllers = ref<ControllerSummary[]>([]);

  const hydrate = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ControllerSummary[];
      controllers.value = parsed;
    } catch (error) {
      console.warn('Failed to restore controllers from storage', error);
    }
  };
  hydrate();

  const addController = (controller: ControllerSummary) => {
    const key = controllerKey(controller);
    if (controllers.value.some((item) => controllerKey(item) === key)) return;
    controllers.value.push({ ...controller, discovered: controller.discovered ?? false });
  };

  // Always keep the simulator available as a selectable controller
  addController(SIMULATOR_CONTROLLER);

  const setDiscoveredControllers = (items: ControllerSummary[]) => {
    const existing = new Map(controllers.value.map((controller) => [controllerKey(controller), controller]));

    items.forEach((controller) => {
      const key = controllerKey(controller);
      const next = controller.kind === 'simulator' ? { discovered: false, ...controller } : { discovered: true, ...controller };
      if (existing.has(key)) {
        existing.set(key, { ...existing.get(key)!, ...next });
      } else {
        existing.set(key, next);
      }
    });

    controllers.value = Array.from(existing.values());
  };

  const removeController = (controller: ControllerSummary) => {
    controllers.value = controllers.value.filter((item) => controllerKey(item) !== controllerKey(controller));
  };

  const userControllers = computed(() => controllers.value.filter((item) => !item.discovered));
  const discoveredControllers = computed(() => controllers.value.filter((item) => item.discovered));

  watch(
    controllers,
    (next) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    { deep: true }
  );

  return {
    controllers,
    userControllers,
    discoveredControllers,
    addController,
    removeController,
    setDiscoveredControllers
  };
});
