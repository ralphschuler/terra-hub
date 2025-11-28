import type { ControllerStatus, ControllerSummary } from '../types';

export const SIMULATOR_CONTROLLER: ControllerSummary = {
  id: 'simulator',
  name: 'Simulator',
  host: 'simulator.local',
  port: 9000,
  protocol: 'sim',
  discovered: false,
  kind: 'simulator'
};

const oscillate = (base: number, amplitude: number, offsetMs: number) => {
  const now = Date.now();
  return base + Math.sin((now + offsetMs) / 1000 / 60) * amplitude;
};

export const fetchSimulatorStatus = async (): Promise<ControllerStatus> => {
  const temperatureC = oscillate(26, 2, 0);
  const humidityPercent = oscillate(48, 6, 20000);
  const lightLevelLux = Math.max(0, Math.round(oscillate(400, 120, 45000)));

  return {
    online: true,
    temperatureC: Number(temperatureC.toFixed(1)),
    humidityPercent: Number(humidityPercent.toFixed(1)),
    lightLevelLux,
    lastSeen: new Date().toISOString(),
    message: 'Simulated environment'
  };
};
