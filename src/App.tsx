import React, { useState } from 'react';
import RadialOrbit from './components/RadialOrbit';
import { demoOrbitData } from './data/demo-orbit-data';
import type { RadialOrbitGroup, RadialOrbitItem } from './types/radial-orbit';

function App() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedDial, setSelectedDial] = useState<number | null>(null);

  const handleGroupSelect = (group: RadialOrbitGroup) => {
    setSelectedGroup(group.id);
    console.log('Group selected:', group);
  };

  const handleItemSelect = (item: RadialOrbitItem, group: RadialOrbitGroup) => {
    setSelectedItem(item.id);
    console.log('Item selected:', item, 'from group:', group.label);
  };

  const handleDialSelect = (index: number) => {
    setSelectedDial(index);
    console.log('Dial selected:', index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700">
        <RadialOrbit
          data={demoOrbitData}
          width={900}
          height={900}
          sortableBy="value"
          onGroupSelect={handleGroupSelect}
          onItemSelect={handleItemSelect}
          onDialSelect={handleDialSelect}
          animation={{
            orbitRotation: true,
            orbitSpeedBase: 80,
            hoverScale: 1.15,
          }}
          colors={{
            background: 'transparent',
            ring: 'rgba(100, 116, 139, 0.3)',
            center: '#1e293b',
            tooltip: 'rgba(15, 23, 42, 0.95)',
          }}
        />
      </div>

      <div className="mt-8 flex gap-6 text-sm">
        {selectedGroup && (
          <div className="bg-slate-800/70 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">Selected Group:</span>{' '}
            <span className="text-white font-semibold">{selectedGroup}</span>
          </div>
        )}
        {selectedItem && (
          <div className="bg-slate-800/70 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">Selected Item:</span>{' '}
            <span className="text-white font-semibold">{selectedItem}</span>
          </div>
        )}
        {selectedDial !== null && (
          <div className="bg-slate-800/70 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">Selected Dial:</span>{' '}
            <span className="text-white font-semibold">{selectedDial}</span>
          </div>
        )}
      </div>

      <div className="mt-8 max-w-2xl text-center space-y-2">
        <p className="text-slate-400 text-sm">
          <strong className="text-white">Hover</strong> over rings or items to see details •
          <strong className="text-white"> Click</strong> rings, items, or dial ticks to select •
          <strong className="text-white"> Watch</strong> the orbital rotation animation
        </p>
      </div>
    </div>
  );
}

export default App;
