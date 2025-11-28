export type ControllerProtocol = 'http' | 'https' | 'udp' | 'sim';

export type ControllerKind = 'hardware' | 'simulator';

export interface ControllerSummary {
  id?: string;
  name: string;
  host: string;
  port: number;
  protocol?: ControllerProtocol;
  discovered?: boolean;
  kind?: ControllerKind;
}

export interface ControllerStatus {
  online: boolean;
  temperatureC?: number;
  humidityPercent?: number;
  lightLevelLux?: number;
  lastSeen?: string;
  message?: string;
}

export interface ControllerHealth extends ControllerSummary {
  status: ControllerStatus;
}

export interface DeviceConfig {
  apSsid: string;
  apPassword?: string;
  apIp?: string;
  stationIp?: string;
  stationConnected: boolean;
  wifiConfigured: boolean;
  stationSsid?: string;
  hostname?: string;
}

export interface WifiConfigPayload {
  ssid: string;
  password: string;
  hostname?: string;
}
