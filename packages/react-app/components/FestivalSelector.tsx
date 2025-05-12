import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FestivalSelectorProps {
  selectedFestival: string;
  onSelectFestival: (festival: string) => void;
}

const FestivalSelector: React.FC<FestivalSelectorProps> = ({
  selectedFestival,
  onSelectFestival,
}) => {
  const festivals = [
    { id: 'christmas', name: 'Christmas' },
    { id: 'newyear', name: 'New Year' },
    { id: 'eid', name: 'Eid' },
    { id: 'sallah', name: 'Sallah' }
  ];

  return (
    <div className="space-y-2">
      <label htmlFor="festival-select" className="text-sm font-medium">
        Select Festival
      </label>
      <Select
        value={selectedFestival}
        onValueChange={onSelectFestival}
      >
        <SelectTrigger className="w-full" id="festival-select">
          <SelectValue placeholder="Select a festival" />
        </SelectTrigger>
        <SelectContent>
          {festivals.map((festival) => (
            <SelectItem key={festival.id} value={festival.id}>
              {festival.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FestivalSelector;
