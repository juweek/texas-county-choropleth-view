import React, { useState } from 'react';

interface TabItem {
  icon: string;
  title: string;
  description: string;
}

interface TabContent {
  image: string;
  items: TabItem[];
}

const TABS: string[] = ['HELP PEOPLE', 'PREPARE', 'PROTECT PROPERTY', 'COORDINATE'];

const tabContent: TabContent[] = [
  {
    image: '/images/help-people.png', // placeholder
    items: [
      { icon: '📞', title: 'Neque porro quisquam', description: 'Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.' },
      { icon: '📝', title: 'Lorem ipsum dolor sit amet', description: 'Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.' },
      { icon: '📍', title: 'Onsectetur adipiscing elit.', description: 'Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.' }
    ]
  },
  {
    image: '/images/prepare.png',
    items: [
      { icon: '📞', title: 'Prepare tab 1', description: 'Some description about preparing 1.' },
      { icon: '📝', title: 'Prepare tab 2', description: 'Some description about preparing 2.' },
      { icon: '📍', title: 'Prepare tab 3', description: 'Some description about preparing 3.' }
    ]
  },
  {
    image: '/images/protect.png',
    items: [
      { icon: '📞', title: 'Protect tab 1', description: 'Info about property protection 1.' },
      { icon: '📝', title: 'Protect tab 2', description: 'Info about property protection 2.' },
      { icon: '📍', title: 'Protect tab 3', description: 'Info about property protection 3.' }
    ]
  },
  {
    image: '/images/coordinate.png',
    items: [
      { icon: '📞', title: 'Coordinate tab 1', description: 'Info about coordination 1.' },
      { icon: '📝', title: 'Coordinate tab 2', description: 'Info about coordination 2.' },
      { icon: '📍', title: 'Coordinate tab 3', description: 'Info about coordination 3.' }
    ]
  }
];

export default function TabbedRiskView(): JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 mb-8 bg-gray-100">
      <div className="flex justify-center gap-6 border-b mb-6">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            className={`py-2 px-4 font-condensed-bold font-bold ${idx === activeTab ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <img 
            src={tabContent[activeTab].image} 
            alt={`${TABS[activeTab]} visualization`} 
            className="w-full rounded shadow" 
          />
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          {tabContent[activeTab].items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="text-2xl bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="font-condensed-bold font-bold text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 