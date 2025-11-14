
import React from 'react';

interface LegendItem {
  color: string;
  label: string;
}

interface LegendProps {
  title: string;
  items: LegendItem[];
  columns?: number;
  splitIndex?: number; // when columns===2, split items at this index into left/right columns (no alternating)
}

export const Legend: React.FC<LegendProps> = ({ title, items, columns = 1, splitIndex }) => {
  return (
    <div className="p-3">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      {columns > 1 ? (
        splitIndex !== undefined && columns === 2 ? (
          <div className="grid grid-cols-2 gap-x-4">
            <div className="space-y-1">
              {items.slice(0, splitIndex).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {items.slice(splitIndex).map((item, index) => (
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
        ) : (
          <div className={`grid gap-y-1 gap-x-4`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
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
        )
      ) : (
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
      )}
    </div>
  );
};
