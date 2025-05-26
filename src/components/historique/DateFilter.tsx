
import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DateFilterProps {
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  selectedMachines: string[];
  onMachinesChange: (machines: string[]) => void;
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const DateFilter = ({
  dateRange,
  onDateRangeChange,
  selectedMachines,
  onMachinesChange,
  selectedMetrics,
  onMetricsChange
}: DateFilterProps) => {
  const machines = ['all', 'Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5', 'Machine 6'];
  const metrics = [
    { key: 'temperature', label: 'Température' },
    { key: 'pressure', label: 'Pression' },
    { key: 'vibration', label: 'Vibration' },
    { key: 'riskScore', label: 'Score de Risque' }
  ];

  const presets = [
    { label: 'Dernière heure', hours: 1 },
    { label: 'Dernières 24h', hours: 24 },
    { label: 'Derniers 7 jours', hours: 24 * 7 },
    { label: 'Dernier mois', hours: 24 * 30 }
  ];

  const handlePresetClick = (hours: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    onDateRangeChange({ start, end });
  };

  const handleMachineToggle = (machine: string) => {
    if (machine === 'all') {
      onMachinesChange(['all']);
    } else {
      const newMachines = selectedMachines.includes(machine)
        ? selectedMachines.filter(m => m !== machine)
        : [...selectedMachines.filter(m => m !== 'all'), machine];
      onMachinesChange(newMachines.length === 0 ? ['all'] : newMachines);
    }
  };

  const handleMetricToggle = (metric: string) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter(m => m !== metric)
      : [...selectedMetrics, metric];
    onMetricsChange(newMetrics.length === 0 ? ['temperature'] : newMetrics);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Période */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="datetime-local"
              value={dateRange.start.toISOString().slice(0, 16)}
              onChange={(e) => onDateRangeChange({
                ...dateRange,
                start: new Date(e.target.value)
              })}
            />
            <Input
              type="datetime-local"
              value={dateRange.end.toISOString().slice(0, 16)}
              onChange={(e) => onDateRangeChange({
                ...dateRange,
                end: new Date(e.target.value)
              })}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.hours)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Machines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Machines</label>
        <div className="space-y-2">
          {machines.map((machine) => (
            <label key={machine} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMachines.includes(machine)}
                onChange={() => handleMachineToggle(machine)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                {machine === 'all' ? 'Toutes les machines' : machine}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Métriques */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Métriques</label>
        <div className="space-y-2">
          {metrics.map((metric) => (
            <label key={metric.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric.key)}
                onChange={() => handleMetricToggle(metric.key)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{metric.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
