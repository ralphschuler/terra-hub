import axios from 'axios';
import type { ControllerHealth, ControllerStatus, ControllerSummary } from '../types';
import { SIMULATOR_CONTROLLER, fetchSimulatorStatus } from './simulator';

const api = axios.create({
  baseURL: '/api'
});

export const discoverControllers = async (): Promise<ControllerSummary[]> => {
  const { data } = await api.get<{ controllers?: ControllerSummary[] }>('/controllers/discover');
  const discovered = data.controllers?.map((controller, index) => ({
    name: controller.name || `Controller ${index + 1}`,
    protocol: controller.protocol ?? 'http',
    ...controller
  })) ?? [];

  return [SIMULATOR_CONTROLLER, ...discovered];
};

export const fetchControllerStatus = async (
  controller: ControllerSummary
): Promise<ControllerStatus> => {
  if (controller.kind === 'simulator' || controller.protocol === 'sim') {
    return fetchSimulatorStatus();
  }

  const { data } = await api.get<ControllerStatus>(`/controllers/status`, {
    params: {
      host: controller.host,
      port: controller.port,
      protocol: controller.protocol ?? 'http'
    }
  });

  return {
    online: data.online,
    temperatureC: data.temperatureC,
    humidityPercent: data.humidityPercent,
    lightLevelLux: data.lightLevelLux,
    lastSeen: data.lastSeen,
    message: data.message
  };
};

export const fetchControllerHealth = async (
  controller: ControllerSummary
): Promise<ControllerHealth> => {
  const status = await fetchControllerStatus(controller);
  return { ...controller, status };
};
