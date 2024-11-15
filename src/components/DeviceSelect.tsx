import { Select } from './Select';

interface DeviceSelectProps {
  devices: MediaDeviceInfo[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function DeviceSelect({ devices, value, onChange, label }: DeviceSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-600"
      >
        {devices.map((device) => (
          <option 
            key={device.deviceId} 
            value={device.deviceId}
            className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
          >
            {device.label || `${label} ${devices.indexOf(device) + 1}`}
          </option>
        ))}
      </Select>
    </div>
  );
}