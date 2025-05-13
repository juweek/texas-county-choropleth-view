import React, { useState } from 'react';
import { getAssetPath } from '@/utils/paths';

interface TabItem {
  icon: string;
  title: string;
  description: string;
}

interface TabContent {
  video: string;
  items: TabItem[];
}

const TABS: Array<{id: string, label: string, icon: string}> = [
  {id: 'help-people', label: 'HELP PEOPLE', icon: '👥'},
  {id: 'prepare', label: 'PREPARE', icon: '🛠️'},
  {id: 'protect', label: 'PROTECT PROPERTY', icon: '🏠'},
  {id: 'coordinate', label: 'COORDINATE', icon: '🤝'}
];

const tabContent: TabContent[] = [
  {
    video: getAssetPath('videos/drip_video.mp4'), // placeholder
    items: [
      { icon: '', title: 'Help People', description: 'The Digital Risk Infrastructure Program (DRIP) is a mobile friendly web application that helps county officials, emergency coordinators, and community members document and track flood damage imagery on the TDIS platform.' }
    ]
  },
  {
    video: getAssetPath('videos/ramp_video.mp4'),
    items: [
      { icon: '', title: 'Prepare', description: 'The Risk Assessment Mapping and Planning tool (RAMP) transforms complex hazard data into actionable insights. City and county officials can generate custom visualizations and export professional-quality maps, tables, and figures specific to their jurisdictions.' }
    ]
  },
  {
    video: getAssetPath('videos/buyers_aware.mp4'),
    items: [
      { icon: '', title: 'Protect Property', description: 'Buyers Aware simplifies disaster risk assessment for potential homebuyers through a single, comprehensive portal that provides property-specific risk information in an easy-to-understand format.' }
    ]
  },
  {
    video: getAssetPath('videos/buyers_aware.mp4'),
    items: [
      { icon: '', title: 'Coordinate', description: 'In partnership with the Texas Water Development Board, our Model Management and Storage Solution (MS2) collects and processes complex flood models from regional engineers across Texas, creating a unified statewide flooding visualization system.' }
    ]
  }
];

export default function TabbedRiskView(): JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="w-full max-w-6xl mx-auto p-12 bg-custom-blue text-white">
      <div className="flex justify-center gap-6 border-b mb-6">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            className={`py-3 px-6 font-condensed-bold font-bold flex flex-col items-center transition-colors duration-200 ${
              idx === activeTab 
                ? 'border-b-2 border-custom-blue text-gray-400' 
                : 'text-white hover:text-white'
            }`}
            onClick={() => setActiveTab(idx)}
          >
            <span className="text-2xl mb-2">{tab.icon}</span>
            <span className="text-md">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/5">
          <video 
            src={tabContent[activeTab].video} 
            className="w-full rounded shadow border-[2px] border-black"
            style={{ boxShadow: '-10px 10px 0px #000' }}
            autoPlay
            muted
            playsInline
            loop
          />
        </div>

        <div className="w-full md:w-2/5 space-y-6">
          {tabContent[activeTab].items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="text-2xl bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="font-condensed-bold font-bold text-lg">{item.title}</h3>
                <p className="text-white text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 