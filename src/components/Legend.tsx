
import React from 'react';

interface LegendItem {
  color: string;
  label: string;
}

interface LegendProps {
  title: string;
  items: LegendItem[];
}

export const Legend: React.FC<LegendProps> = ({ title, items }) => {
  return (
    <div className="p-3">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
