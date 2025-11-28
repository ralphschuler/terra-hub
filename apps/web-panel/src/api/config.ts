import axios from 'axios';
import type { DeviceConfig, WifiConfigPayload } from '../types';

const api = axios.create({
  baseURL: '/api'
});

export const fetchDeviceConfig = async (): Promise<DeviceConfig> => {
  const { data } = await api.get<DeviceConfig>('/config');
  return {
    apSsid: data.apSsid,
    apPassword: data.apPassword,
    apIp: data.apIp,
    stationIp: data.stationIp,
    stationConnected: data.stationConnected,
    wifiConfigured: data.wifiConfigured,
    stationSsid: data.stationSsid,
    hostname: data.hostname
  };
};

export const updateWifiConfig = async (payload: WifiConfigPayload) => {
  const { data } = await api.post('/config/wifi', payload);
  return data as { connected: boolean; ip?: string; ssid?: string; hostname?: string };
};
