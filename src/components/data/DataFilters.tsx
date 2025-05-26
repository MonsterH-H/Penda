import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Filter } from 'lucide-react';

interface DataFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMachine: string;
  onMachineChange: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onResetFilters: () => void;
  machines: string[];
}

export const DataFilters = ({
  searchTerm,
  onSearchChange,
  selectedMachine,
  onMachineChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
  machines
}: DataFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-full sm:w-auto"
        />
      </div>
      
      <Select value={selectedMachine} onValueChange={onMachineChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Toutes les machines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les machines</SelectItem>
          {machines.map(machine => (
            <SelectItem key={machine} value={machine}>{machine}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>Du {format(dateRange.from, 'dd/MM/yyyy')} au {format(dateRange.to, 'dd/MM/yyyy')}</>
              ) : (
                <>Depuis {format(dateRange.from, 'dd/MM/yyyy')}</>
              )
            ) : (
              "Période"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: dateRange.from,
              to: dateRange.to
            }}
            onSelect={(range) => onDateRangeChange({
              from: range?.from,
              to: range?.to
            })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="outline" 
        onClick={onResetFilters}
        className="w-full sm:w-auto"
      >
        <Filter className="w-4 h-4 mr-2" />
        Réinitialiser
      </Button>
    </div>
  );
};
