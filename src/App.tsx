import { useState, useEffect } from 'react';
import RadialOrbit from './components/RadialOrbit';
import { demoOrbitData } from './data/demo-orbit-data';
import type { RadialOrbitGroup, RadialOrbitItem } from './types/radial-orbit';

function App() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedDial, setSelectedDial] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
        position: 'relative',
      }}
    >
      <RadialOrbit
        data={demoOrbitData}
        width={dimensions.width}
        height={dimensions.height}
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

      {(selectedGroup || selectedItem || selectedDial !== null) && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
            zIndex: 100,
          }}
        >
          {selectedGroup && (
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ color: '#94a3b8' }}>Selected Group:</span>{' '}
              <span style={{ color: 'white', fontWeight: 600 }}>{selectedGroup}</span>
            </div>
          )}
          {selectedItem && (
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ color: '#94a3b8' }}>Selected Item:</span>{' '}
              <span style={{ color: 'white', fontWeight: 600 }}>{selectedItem}</span>
            </div>
          )}
          {selectedDial !== null && (
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(51, 65, 85, 1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ color: '#94a3b8' }}>Selected Dial:</span>{' '}
              <span style={{ color: 'white', fontWeight: 600 }}>{selectedDial}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
