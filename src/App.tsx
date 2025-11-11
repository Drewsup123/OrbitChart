import { useState, useMemo, useEffect } from 'react';
import RadialOrbit from './components/RadialOrbit';
import { demoOrbitData } from './data/demo-orbit-data';
import { userApplicationsData } from './data/user-applications-data';
import { teamCollaborationData } from './data/team-collaboration-data';
import { companySpendData } from './data/company-spend-data';
import { stressTestData } from './data/stress-test-data';
import type { RadialOrbitGroup, RadialOrbitItem, ItemRendererProps } from './types/radial-orbit';

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

  // Custom renderer that uses foreignObject to render React component
  const customItemRenderer = (props: ItemRendererProps) => {
    const { item, radius, scale } = props;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backgroundImage: `url(${item.iconUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxSizing: 'border-box',
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
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Fixed Left Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '280px',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid rgba(51, 65, 85, 1)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '24px',
            marginTop: 0,
          }}
        >
          Chart Controls
        </h2>

        {/* Demo Data Selector */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Demo Data
          </label>
          <select
            value={selectedDataSet}
            onChange={(e) => {
              setSelectedDataSet(e.target.value as DemoDataSetKey);
              setGroupOrbits(undefined);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 1)',
              color: '#cbd5e1',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {Object.entries(demoDataSets).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Size Controls */}
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Size
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                Width: {chartSize.width}px
              </label>
              <input
                type="range"
                min="400"
                max="1200"
                step="50"
                value={chartSize.width}
                onChange={(e) =>
                  setChartSize({ ...chartSize, width: parseInt(e.target.value) })
                }
                style={{
                  width: '100%',
                  accentColor: '#60a5fa',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                Height: {chartSize.height}px
              </label>
              <input
                type="range"
                min="400"
                max="1200"
                step="50"
                value={chartSize.height}
                onChange={(e) =>
                  setChartSize({ ...chartSize, height: parseInt(e.target.value) })
                }
                style={{
                  width: '100%',
                  accentColor: '#60a5fa',
                }}
              />
            </div>
          </div>
        </div>

        {/* Animation Controls */}
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Animation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={animation.orbitRotation}
                onChange={(e) =>
                  setAnimation({ ...animation, orbitRotation: e.target.checked })
                }
                style={{ accentColor: '#60a5fa' }}
              />
              Orbit Rotation
            </label>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                Speed: {animation.orbitSpeedBase}s
              </label>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={animation.orbitSpeedBase}
                onChange={(e) =>
                  setAnimation({
                    ...animation,
                    orbitSpeedBase: parseInt(e.target.value),
                  })
                }
                style={{
                  width: '100%',
                  accentColor: '#60a5fa',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                Hover Scale: {animation.hoverScale}x
              </label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.05"
                value={animation.hoverScale}
                onChange={(e) =>
                  setAnimation({
                    ...animation,
                    hoverScale: parseFloat(e.target.value),
                  })
                }
                style={{
                  width: '100%',
                  accentColor: '#60a5fa',
                }}
              />
            </div>
            {animation.orbitRotation && (
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Animate Orbits
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentData.groups.map((group) => (
                    <label
                      key={group.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        backgroundColor: (animation.orbits === undefined || (animation.orbits && animation.orbits.includes(group.id)))
                          ? 'rgba(96, 165, 250, 0.2)'
                          : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={animation.orbits === undefined || (animation.orbits && animation.orbits.includes(group.id))}
                        onChange={(e) => {
                          if (animation.orbits === undefined) {
                            // If undefined, initialize with all groups except this one (if unchecking) or all groups (if checking)
                            const allGroupIds = currentData.groups.map(g => g.id);
                            if (e.target.checked) {
                              setAnimation({
                                ...animation,
                                orbits: allGroupIds,
                              });
                            } else {
                              setAnimation({
                                ...animation,
                                orbits: allGroupIds.filter(id => id !== group.id),
                              });
                            }
                          } else {
                            const currentOrbits = animation.orbits;
                            if (e.target.checked) {
                              setAnimation({
                                ...animation,
                                orbits: [...currentOrbits, group.id],
                              });
                            } else {
                              const newOrbits = currentOrbits.filter(id => id !== group.id);
                              setAnimation({
                                ...animation,
                                orbits: newOrbits.length === 0 ? undefined : newOrbits,
                              });
                            }
                          }
                        }}
                        style={{ accentColor: '#60a5fa' }}
                      />
                      {group.label}
                    </label>
                  ))}
                  {animation.orbits !== undefined && (
                    <button
                      onClick={() => setAnimation({ ...animation, orbits: undefined })}
                      style={{
                        marginTop: '4px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: 'rgba(96, 165, 250, 0.2)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '4px',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      Clear Selection (Animate All)
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Data Loaded Animation */}
            <div style={{ marginTop: '16px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              >
                Data Loaded Animation
              </label>
              <select
                value={animation.dataLoadedAnimation ?? 'sides'}
                onChange={(e) =>
                  setAnimation({
                    ...animation,
                    dataLoadedAnimation: e.target.value as 'sides' | 'center' | 'none',
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 1)',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <option value="sides">Sides (Scale & Fade)</option>
                <option value="center">Center (From Center)</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Types Controls */}
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Filter Types
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentData.groups.map((group) => (
              <label
                key={group.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: visibleGroups[group.id]
                    ? 'rgba(96, 165, 250, 0.1)'
                    : 'transparent',
                  transition: 'background-color 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleGroups[group.id] !== false}
                  onChange={(e) =>
                    setVisibleGroups({
                      ...visibleGroups,
                      [group.id]: e.target.checked,
                    })
                  }
                  style={{ accentColor: '#60a5fa' }}
                />
                {group.label}
              </label>
            ))}
          </div>
        </div>

        {/* Group By Control */}
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Layout
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: groupBy ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={groupBy}
                onChange={(e) => setGroupBy(e.target.checked)}
                style={{ accentColor: '#60a5fa' }}
              />
              Group By Type
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: groupOrbits !== undefined ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={groupOrbits !== undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Auto-assign all visible groups to separate orbits
                    const visibleGroupIds = currentData.groups
                      .filter(g => visibleGroups[g.id] !== false)
                      .map(g => g.id);
                    if (visibleGroupIds.length > 0) {
                      setGroupOrbits(visibleGroupIds.map(id => [id]));
                    } else {
                      setGroupOrbits([[]]);
                    }
                  } else {
                    setGroupOrbits(undefined);
                  }
                }}
                style={{ accentColor: '#60a5fa' }}
              />
              Group Orbits
            </label>
            {groupOrbits !== undefined && (
              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Configure Orbits:
                  </div>
                  <button
                    onClick={() => {
                      setGroupOrbits([...groupOrbits, []]);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      backgroundColor: 'rgba(96, 165, 250, 0.2)',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '4px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Orbit
                  </button>
                </div>
                
                {groupOrbits.map((orbit, orbitIndex) => {
                  const availableGroups = currentData.groups
                    .filter(g => visibleGroups[g.id] !== false)
                    .map(g => g.id);
                  const unassignedGroups = availableGroups.filter(
                    groupId => !groupOrbits.some((o, idx) => idx !== orbitIndex && o.includes(groupId))
                  );
                  
                  return (
                    <div
                      key={orbitIndex}
                      style={{
                        marginBottom: '8px',
                        padding: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '4px',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 600 }}>
                          Orbit {orbitIndex + 1}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {orbitIndex > 0 && (
                            <button
                              onClick={() => {
                                const newOrbits = [...groupOrbits];
                                [newOrbits[orbitIndex - 1], newOrbits[orbitIndex]] = [newOrbits[orbitIndex], newOrbits[orbitIndex - 1]];
                                setGroupOrbits(newOrbits);
                              }}
                              style={{
                                padding: '2px 6px',
                                fontSize: '9px',
                                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                borderRadius: '3px',
                                color: '#cbd5e1',
                                cursor: 'pointer',
                              }}
                            >
                              ↑
                            </button>
                          )}
                          {orbitIndex < groupOrbits.length - 1 && (
                            <button
                              onClick={() => {
                                const newOrbits = [...groupOrbits];
                                [newOrbits[orbitIndex], newOrbits[orbitIndex + 1]] = [newOrbits[orbitIndex + 1], newOrbits[orbitIndex]];
                                setGroupOrbits(newOrbits);
                              }}
                              style={{
                                padding: '2px 6px',
                                fontSize: '9px',
                                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                borderRadius: '3px',
                                color: '#cbd5e1',
                                cursor: 'pointer',
                              }}
                            >
                              ↓
                            </button>
                          )}
                          {groupOrbits.length > 1 && (
                            <button
                              onClick={() => {
                                const newOrbits = groupOrbits.filter((_, idx) => idx !== orbitIndex);
                                setGroupOrbits(newOrbits.length > 0 ? newOrbits : undefined);
                              }}
                              style={{
                                padding: '2px 6px',
                                fontSize: '9px',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '3px',
                                color: '#cbd5e1',
                                cursor: 'pointer',
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Groups in this orbit */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {orbit.map((groupId, groupIdx) => {
                          const group = currentData.groups.find(g => g.id === groupId);
                          if (!group) return null;
                          return (
                            <div
                              key={groupId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 6px',
                                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#cbd5e1',
                              }}
                            >
                              <span>{group.label}</span>
                              {orbit.length > 1 && groupIdx > 0 && (
                                <button
                                  onClick={() => {
                                    const newOrbits = [...groupOrbits];
                                    const newOrbit = [...orbit];
                                    [newOrbit[groupIdx - 1], newOrbit[groupIdx]] = [newOrbit[groupIdx], newOrbit[groupIdx - 1]];
                                    newOrbits[orbitIndex] = newOrbit;
                                    setGroupOrbits(newOrbits);
                                  }}
                                  style={{
                                    padding: '1px 3px',
                                    fontSize: '8px',
                                    backgroundColor: 'rgba(96, 165, 250, 0.3)',
                                    border: 'none',
                                    borderRadius: '2px',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ←
                                </button>
                              )}
                              {orbit.length > 1 && groupIdx < orbit.length - 1 && (
                                <button
                                  onClick={() => {
                                    const newOrbits = [...groupOrbits];
                                    const newOrbit = [...orbit];
                                    [newOrbit[groupIdx], newOrbit[groupIdx + 1]] = [newOrbit[groupIdx + 1], newOrbit[groupIdx]];
                                    newOrbits[orbitIndex] = newOrbit;
                                    setGroupOrbits(newOrbits);
                                  }}
                                  style={{
                                    padding: '1px 3px',
                                    fontSize: '8px',
                                    backgroundColor: 'rgba(96, 165, 250, 0.3)',
                                    border: 'none',
                                    borderRadius: '2px',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                >
                                  →
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const newOrbits = [...groupOrbits];
                                  newOrbits[orbitIndex] = orbit.filter(id => id !== groupId);
                                  setGroupOrbits(newOrbits);
                                }}
                                style={{
                                  padding: '1px 4px',
                                  fontSize: '9px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                  border: 'none',
                                  borderRadius: '2px',
                                  color: '#cbd5e1',
                                  cursor: 'pointer',
                                  marginLeft: '2px',
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Add groups to this orbit */}
                      {unassignedGroups.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const newOrbits = [...groupOrbits];
                              newOrbits[orbitIndex] = [...orbit, e.target.value];
                              setGroupOrbits(newOrbits);
                              e.target.value = '';
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '4px 6px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            border: '1px solid rgba(51, 65, 85, 1)',
                            borderRadius: '4px',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">+ Add group to orbit...</option>
                          {unassignedGroups.map(groupId => {
                            const group = currentData.groups.find(g => g.id === groupId);
                            return group ? (
                              <option key={groupId} value={groupId}>
                                {group.label}
                              </option>
                            ) : null;
                          })}
                        </select>
                      )}
                    </div>
                  );
                })}
                
                {/* Unassigned groups */}
                {(() => {
                  const assignedGroups = new Set(groupOrbits.flat());
                  const unassignedGroups = currentData.groups
                    .filter(g => visibleGroups[g.id] !== false && !assignedGroups.has(g.id))
                    .map(g => g.id);
                  
                  if (unassignedGroups.length === 0) return null;
                  
                  return (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '4px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '6px' }}>
                        Unassigned Groups:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {unassignedGroups.map(groupId => {
                          const group = currentData.groups.find(g => g.id === groupId);
                          if (!group) return null;
                          return (
                            <div
                              key={groupId}
                              style={{
                                padding: '4px 6px',
                                backgroundColor: 'rgba(100, 116, 139, 0.2)',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#94a3b8',
                              }}
                            >
                              {group.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Orbit Paths Controls */}
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Orbit Paths
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={orbitPaths.show}
                onChange={(e) =>
                  setOrbitPaths({ ...orbitPaths, show: e.target.checked })
                }
                style={{ accentColor: '#60a5fa' }}
              />
              Show Paths
            </label>
            {orbitPaths.show && (
              <>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Stroke Width: {orbitPaths.strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={orbitPaths.strokeWidth}
                    onChange={(e) =>
                      setOrbitPaths({
                        ...orbitPaths,
                        strokeWidth: parseFloat(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      accentColor: '#60a5fa',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Style
                  </label>
                  <select
                    value={orbitPaths.strokeDasharray}
                    onChange={(e) =>
                      setOrbitPaths({
                        ...orbitPaths,
                        strokeDasharray: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(51, 65, 85, 1)',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="none">Solid</option>
                    <option value="5,5">Dotted</option>
                    <option value="10,5">Dashed</option>
                    <option value="2,2">Fine Dotted</option>
                    <option value="15,5">Long Dashed</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Opacity: {orbitPaths.opacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={orbitPaths.opacity}
                    onChange={(e) =>
                      setOrbitPaths({
                        ...orbitPaths,
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      accentColor: '#60a5fa',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Hover Stroke Width: {orbitPaths.hoverStrokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={orbitPaths.hoverStrokeWidth}
                    onChange={(e) =>
                      setOrbitPaths({
                        ...orbitPaths,
                        hoverStrokeWidth: parseFloat(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      accentColor: '#60a5fa',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Hover Opacity: {orbitPaths.hoverOpacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={orbitPaths.hoverOpacity}
                    onChange={(e) =>
                      setOrbitPaths({
                        ...orbitPaths,
                        hoverOpacity: parseFloat(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      accentColor: '#60a5fa',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
            renderItem={customItemRenderer}
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
    </div>
  );
}

export default App;
