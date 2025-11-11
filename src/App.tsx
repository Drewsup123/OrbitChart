import React, { useState, useMemo, useEffect } from 'react';
import RadialOrbit from './components/RadialOrbit';
import ChartControlsSidebar from './documentation_components/ChartControlsSidebar';
import CodePreviewSidebar from './documentation_components/CodePreviewSidebar';
import { demoOrbitData } from './data/demo-orbit-data';
import { userApplicationsData } from './data/user-applications-data';
import { teamCollaborationData } from './data/team-collaboration-data';
import { companySpendData } from './data/company-spend-data';
import { stressTestData } from './data/stress-test-data';
import type { RadialOrbitGroup, RadialOrbitItem, ItemShape, ItemRendererProps } from './types/radial-orbit';

const demoDataSets = {
  'enterprise': { label: 'Enterprise Stack', data: demoOrbitData },
  'user-apps': { label: 'User Applications', data: userApplicationsData },
  'team-collab': { label: 'Team Collaboration', data: teamCollaborationData },
  'company-spend': { label: 'Company Spend', data: companySpendData },
  'stress-test': { label: 'Stress Test', data: stressTestData },
} as const;

type DemoDataSetKey = keyof typeof demoDataSets;

function App() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedDial, setSelectedDial] = useState<number | null>(null);
  const [selectedDataSet, setSelectedDataSet] = useState<DemoDataSetKey>('enterprise');
  
  // Get current data set
  const currentData = demoDataSets[selectedDataSet].data;
  
  // Control states
  const [chartSize, setChartSize] = useState({ width: 800, height: 800 });
  const [animation, setAnimation] = useState<{
    orbitRotation: boolean;
    orbitSpeedBase: number;
    hoverScale: number;
    orbits?: string[];
    dataLoadedAnimation?: 'sides' | 'center' | 'none';
  }>({
    orbitRotation: true,
    orbitSpeedBase: 80,
    hoverScale: 1.15,
    orbits: undefined, // undefined = animate all, [] = animate none, [ids] = animate selected
    dataLoadedAnimation: 'sides', // Default to 'sides'
  });
  
  // Initialize visibleGroups based on current data set
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    currentData.groups.forEach(group => {
      initial[group.id] = true;
    });
    return initial;
  });
  
  const [groupBy, setGroupBy] = useState(false);
  const [groupOrbits, setGroupOrbits] = useState<string[][] | undefined>(undefined);
  const [orbitPaths, setOrbitPaths] = useState({
    show: true,
    strokeWidth: 2,
    strokeDasharray: '5,5',
    opacity: 0.7,
    hoverStrokeWidth: 3,
    hoverOpacity: 0.9,
  });
  
  const [itemShape, setItemShape] = useState<ItemShape>('circle');
  
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  
  // Update visibleGroups when data set changes.
  useEffect(() => {
    const newVisibleGroups: Record<string, boolean> = {};
    currentData.groups.forEach(group => {
      newVisibleGroups[group.id] = true;
    });
    setVisibleGroups(newVisibleGroups);
  }, [selectedDataSet]);

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

  // Custom renderer for colors only (no images)
  const colorOnlyRenderer = (props: ItemRendererProps) => {
    const { item, group } = props;
    
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: item.color || group.color || '#60a5fa',
        }}
      />
    );
  };

  // Filter groups based on visibility
  const filteredData = useMemo(() => ({
    ...currentData,
    groups: currentData.groups.filter(group => visibleGroups[group.id] !== false),
  }), [currentData, visibleGroups]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
        position: 'relative',
        display: 'flex',
        paddingLeft: '280px',
        paddingRight: isCodeDrawerOpen ? '500px' : '0',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'padding-right 0.3s ease',
      }}
    >
      <ChartControlsSidebar
        selectedDataSet={selectedDataSet}
        setSelectedDataSet={(value) => setSelectedDataSet(value as DemoDataSetKey)}
        demoDataSets={demoDataSets}
        chartSize={chartSize}
        setChartSize={setChartSize}
        animation={animation}
        setAnimation={setAnimation}
        visibleGroups={visibleGroups}
        setVisibleGroups={setVisibleGroups}
        currentData={currentData}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        groupOrbits={groupOrbits}
        setGroupOrbits={setGroupOrbits}
        orbitPaths={orbitPaths}
        setOrbitPaths={setOrbitPaths}
        itemShape={itemShape}
        setItemShape={setItemShape}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 20px 80px 20px',
          gap: '60px',
          width: '100%',
        }}
      >
        {/* First Demo - Default */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: chartSize.height + 40,
          }}
        >
        <RadialOrbit
          data={filteredData}
          width={chartSize.width}
          height={chartSize.height}
          sortableBy="value"
          onGroupSelect={handleGroupSelect}
          onItemSelect={handleItemSelect}
          onDialSelect={handleDialSelect}
          itemShape={itemShape}
          animation={animation}
          groupBy={groupBy}
          groupOrbits={groupOrbits}
          orbitPaths={orbitPaths}
          colors={{
            background: 'transparent',
            ring: 'rgba(100, 116, 139, 0.3)',
            center: '#1e293b',
            tooltip: 'rgba(15, 23, 42, 0.95)',
          }}
        />
      </div>

        {/* Second Demo - Custom Renderer */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            overflow: 'hidden',
            minHeight: chartSize.height + 40,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Custom Renderer
          </div>
          <RadialOrbit
            data={filteredData}
            width={chartSize.width}
            height={chartSize.height}
            sortableBy="value"
            onGroupSelect={handleGroupSelect}
            onItemSelect={handleItemSelect}
            onDialSelect={handleDialSelect}
            itemShape={itemShape}
            animation={animation}
            groupBy={groupBy}
            groupOrbits={groupOrbits}
            orbitPaths={orbitPaths}
            colors={{
              background: 'transparent',
              ring: 'rgba(100, 116, 139, 0.3)',
              center: '#1e293b',
              tooltip: 'rgba(15, 23, 42, 0.95)',
            }}
          />
        </div>

        {/* Third Demo - Colors Only */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            overflow: 'hidden',
            minHeight: chartSize.height + 40,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            Colors Only
          </div>
          <RadialOrbit
            data={filteredData}
            width={chartSize.width}
            height={chartSize.height}
            sortableBy="value"
            onGroupSelect={handleGroupSelect}
            onItemSelect={handleItemSelect}
            onDialSelect={handleDialSelect}
            renderItem={colorOnlyRenderer}
            itemShape={itemShape}
            animation={animation}
            groupBy={groupBy}
            groupOrbits={groupOrbits}
            orbitPaths={orbitPaths}
            colors={{
              background: 'transparent',
              ring: 'rgba(100, 116, 139, 0.3)',
              center: '#1e293b',
              tooltip: 'rgba(15, 23, 42, 0.95)',
            }}
          />
        </div>
      </div>

      {(selectedGroup || selectedItem || selectedDial !== null) && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
            zIndex: 1001,
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

      {/* Code Preview Sidebar */}
      {isCodeDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            height: '100vh',
            zIndex: 999,
          }}
        >
          <CodePreviewSidebar
            isOpen={isCodeDrawerOpen}
            onClose={() => setIsCodeDrawerOpen(false)}
            chartSize={chartSize}
            animation={animation}
            itemShape={itemShape}
            groupBy={groupBy}
            groupOrbits={groupOrbits}
            orbitPaths={orbitPaths}
            colors={{
              background: 'transparent',
              ring: 'rgba(100, 116, 139, 0.3)',
              center: '#1e293b',
              tooltip: 'rgba(15, 23, 42, 0.95)',
            }}
            hasCustomRenderer={false}
            showCustomRenderer={false}
          />
        </div>
      )}

      {/* Code Preview Toggle Button */}
      <button
        onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: isCodeDrawerOpen ? '520px' : '20px',
          padding: '12px 20px',
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          borderRadius: '8px',
          color: '#cbd5e1',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
        }}
      >
        <span>📋</span>
        <span>{isCodeDrawerOpen ? 'Hide' : 'Show'} Code</span>
      </button>
    </div>
  );
}

export default App;
