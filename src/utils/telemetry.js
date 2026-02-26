export const TELEMETRY_ENABLED_KEY = 'telemetry-enabled';
export const TELEMETRY_SETTINGS_EVENT = 'telemetrySettingsChanged';

export const isTelemetryEnabled = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  const saved = localStorage.getItem(TELEMETRY_ENABLED_KEY);
  if (saved === null) {
    return true;
  }
  return saved !== 'false';
};

export const ensureTelemetryDefaultEnabled = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (localStorage.getItem(TELEMETRY_ENABLED_KEY) === null) {
    localStorage.setItem(TELEMETRY_ENABLED_KEY, 'true');
    window.dispatchEvent(new Event(TELEMETRY_SETTINGS_EVENT));
  }
};

export const setTelemetryEnabled = (enabled) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TELEMETRY_ENABLED_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event(TELEMETRY_SETTINGS_EVENT));
};
