import { useState, useMemo } from 'react';
import type {
  RadialOrbitProps,
  RadialOrbitGroup,
  RadialOrbitItem,
} from '../types/radial-orbit';
import {
  valueToRadius,
  sortItems,
  distributeAngles,
  distributeAnglesGrouped,
  polarToCartesian,
} from '../utils/radial-orbit-helpers';

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  content: React.ReactNode;
};

const RadialOrbit: React.FC<RadialOrbitProps> = ({
  data,
  width = 800,
  height = 800,
  sortableBy,
  onGroupSelect,
  onItemSelect,
  onDialSelect,
  renderItem,
  groupBy = false,
  groupOrbits,
  orbitPaths = {
    show: true,
    strokeWidth: 2,
    strokeDasharray: '5,5',
    opacity: 0.7,
    hoverStrokeWidth: 3,
    hoverOpacity: 0.9,
  },
  animation = {
    orbitRotation: true,
    orbitSpeedBase: 60,
    hoverScale: 1.1,
  },
  colors = {
    background: 'rgba(0, 0, 0, 0.05)',
    ring: 'rgba(100, 100, 100, 0.2)',
    center: '#1a1a1a',
    tooltip: 'rgba(0, 0, 0, 0.9)',
  },
  style = {},
}) => {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedDial, setSelectedDial] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculate scale factor based on container size (using minimum dimension for square aspect ratio)
  const minDimension = Math.min(width, height);
  const scaleFactor = minDimension / 800; // Base size is 800px
  
  // Dynamic sizes that scale with container
  const centerRadius = 60 * scaleFactor;
  const dialRadius = centerRadius + 40 * scaleFactor;
  const baseOrbitRadius = dialRadius + 60 * scaleFactor;
  const orbitSpacing = 120 * scaleFactor;
  
  // Calculate maximum available radius (leave padding for items)
  const maxAvailableRadius = Math.min(width, height) / 2 - 50 * scaleFactor;

  const processedGroups = useMemo(() => {
    // If groupOrbits is provided, reorganize groups into orbits
    if (groupOrbits && groupOrbits.length > 0) {
      const groupMap = new Map(data.groups.map(g => [g.id, g]));
      const processedOrbits: Array<{
        orbitIndex: number;
        radius: number;
        groups: Array<{
          group: RadialOrbitGroup;
          sortedItems: RadialOrbitItem[];
          minValue: number;
          maxValue: number;
          itemStartIndex: number;
        }>;
        allItems: Array<{ item: RadialOrbitItem; group: RadialOrbitGroup }>;
        angles: number[];
      }> = [];

      groupOrbits.forEach((orbitGroupIds, orbitIndex) => {
        // Get groups for this orbit
        const orbitGroups = orbitGroupIds
          .map(id => groupMap.get(id))
          .filter((g): g is RadialOrbitGroup => g !== undefined);

        if (orbitGroups.length === 0) return;

        // Calculate orbit radius
        let radius = baseOrbitRadius + orbitIndex * orbitSpacing;
        if (radius > maxAvailableRadius) {
          const availableForOrbits = maxAvailableRadius - baseOrbitRadius;
          radius = baseOrbitRadius + (availableForOrbits / groupOrbits.length) * (orbitIndex + 1);
        }

        // Collect all items from all groups in this orbit, maintaining order
        const allItems: Array<{ item: RadialOrbitItem; group: RadialOrbitGroup }> = [];
        const groupsWithItems: Array<{
          group: RadialOrbitGroup;
          sortedItems: RadialOrbitItem[];
          minValue: number;
          maxValue: number;
          itemStartIndex: number;
        }> = [];

        orbitGroups.forEach((group) => {
          const sortedItems = sortItems(group.items, sortableBy);
          const allValues = sortedItems.map((item) => item.value);
          const minValue = Math.min(...allValues);
          const maxValue = Math.max(...allValues);
          const itemStartIndex = allItems.length;

          sortedItems.forEach(item => {
            allItems.push({ item, group });
          });

          groupsWithItems.push({
            group,
            sortedItems,
            minValue,
            maxValue,
            itemStartIndex,
          });
        });

        // Distribute angles for all items in this orbit
        const angles = groupBy
          ? distributeAnglesGrouped(allItems.length, orbitIndex, groupOrbits.length)
          : distributeAngles(allItems.length);

        processedOrbits.push({
          orbitIndex,
          radius,
          groups: groupsWithItems,
          allItems,
          angles,
        });
      });

      // Convert back to flat structure for rendering
      const flatGroups: Array<RadialOrbitGroup & {
        sortedItems: RadialOrbitItem[];
        radius: number;
        minValue: number;
        maxValue: number;
        angles: number[];
        orbitIndex: number;
        itemStartIndex: number;
      }> = [];

      processedOrbits.forEach((orbit) => {
        orbit.groups.forEach((groupData) => {
          // Get angles for this group's items
          const groupAngles = orbit.angles.slice(
            groupData.itemStartIndex,
            groupData.itemStartIndex + groupData.sortedItems.length
          );

          flatGroups.push({
            ...groupData.group,
            sortedItems: groupData.sortedItems,
            radius: orbit.radius,
            minValue: groupData.minValue,
            maxValue: groupData.maxValue,
            angles: groupAngles,
            orbitIndex: orbit.orbitIndex,
            itemStartIndex: groupData.itemStartIndex,
          });
        });
      });

      return flatGroups;
    }

    // Default behavior: one group per orbit
    const groups = data.groups.map((group, index) => {
      const sortedItems = sortItems(group.items, sortableBy);
      
      // Calculate orbit radius, ensuring it fits within container
      let radius = group.radius || baseOrbitRadius + index * orbitSpacing;
      
      // If radius exceeds available space, scale it down
      if (radius > maxAvailableRadius) {
        // Distribute available space among groups
        const availableForOrbits = maxAvailableRadius - baseOrbitRadius;
        radius = baseOrbitRadius + (availableForOrbits / data.groups.length) * (index + 1);
      }

      const allValues = sortedItems.map((item) => item.value);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);

      // Use grouped angles if groupBy is enabled, otherwise distribute evenly
      const angles = groupBy
        ? distributeAnglesGrouped(sortedItems.length, index, data.groups.length)
        : distributeAngles(sortedItems.length);

      return {
        ...group,
        sortedItems,
        radius,
        minValue,
        maxValue,
        angles,
        orbitIndex: index,
        itemStartIndex: 0,
      } as RadialOrbitGroup & {
        sortedItems: RadialOrbitItem[];
        radius: number;
        minValue: number;
        maxValue: number;
        angles: number[];
        orbitIndex: number;
        itemStartIndex: number;
      };
    });
    
    return groups;
  }, [data.groups, sortableBy, baseOrbitRadius, orbitSpacing, maxAvailableRadius, groupBy, groupOrbits]);

  const handleGroupHover = (
    group: RadialOrbitGroup | null,
    event?: React.MouseEvent
  ) => {
    setHoveredGroup(group?.id || null);
    if (group && event) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        content: (
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{group.label}</div>
            <div style={{ fontSize: '12px', opacity: 0.75 }}>{group.items.length} items</div>
          </div>
        ),
      });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, content: null });
    }
  };

  const handleItemHover = (
    item: RadialOrbitItem | null,
    event?: React.MouseEvent
  ) => {
    setHoveredItem(item?.id || null);
    if (item && event) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        content: (
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', opacity: 0.75 }}>Value: {item.value}</div>
            {item.meta && (
              <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
                {Object.entries(item.meta)
                  .slice(0, 3)
                  .map(([key, val]) => (
                    <div key={key}>
                      {key}: {String(val)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ),
      });
    } else if (!hoveredGroup) {
      setTooltip({ visible: false, x: 0, y: 0, content: null });
    }
  };

  const handleDialClick = (index: number) => {
    setSelectedDial(index);
    onDialSelect?.(index);
  };

  const dialTicks = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const innerPos = polarToCartesian(centerX, centerY, dialRadius - 10, angle);
      const outerPos = polarToCartesian(centerX, centerY, dialRadius + 10, angle);
      return { index: i, innerPos, outerPos, angle };
    });
  }, [centerX, centerY, dialRadius]);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        background: colors.background,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor={colors.center} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.center} stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {orbitPaths.show !== false && (() => {
          // When groupOrbits is used, render one ring per unique radius
          // Otherwise, render one ring per group
          if (groupOrbits && groupOrbits.length > 0) {
            const uniqueOrbits = new Map<number, RadialOrbitGroup[]>();
            processedGroups.forEach((group) => {
              const existing = uniqueOrbits.get(group.radius) || [];
              uniqueOrbits.set(group.radius, [...existing, group]);
            });

            return Array.from(uniqueOrbits.entries()).map(([radius, groups]) => {
              // Use first group's color for the ring
              const firstGroup = groups[0];
              let ringColor = colors.ring;
              if (firstGroup.id === 'finance') {
                ringColor = 'rgba(16, 185, 129, 0.7)'; // green
              } else if (firstGroup.id === 'company-stack') {
                ringColor = 'rgba(234, 179, 8, 0.7)'; // yellow
              } else if (firstGroup.id === 'shadow-it') {
                ringColor = 'rgba(239, 68, 68, 0.7)'; // red
              }

              const isHovered = groups.some(g => hoveredGroup === g.id);
              const strokeWidth = isHovered 
                ? (orbitPaths.hoverStrokeWidth ?? orbitPaths.strokeWidth ?? 3)
                : (orbitPaths.strokeWidth ?? 2);
              const opacity = isHovered
                ? (orbitPaths.hoverOpacity ?? orbitPaths.opacity ?? 0.9)
                : (orbitPaths.opacity ?? 0.7);

              return (
                <g key={`orbit-${radius}`}>
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={orbitPaths.strokeDasharray === 'none' ? 'none' : (orbitPaths.strokeDasharray ?? '5,5')}
                    opacity={opacity}
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => handleGroupHover(firstGroup, e)}
                    onMouseLeave={() => handleGroupHover(null)}
                    onClick={() => onGroupSelect?.(firstGroup)}
                  />
                </g>
              );
            });
          }

          // Default: one ring per group
          return processedGroups.map((group) => {
            // Determine ring color based on group type
            let ringColor = colors.ring;
            if (group.id === 'finance') {
              ringColor = 'rgba(16, 185, 129, 0.7)'; // green - more visible
            } else if (group.id === 'company-stack') {
              ringColor = 'rgba(234, 179, 8, 0.7)'; // yellow - more visible
            } else if (group.id === 'shadow-it') {
              ringColor = 'rgba(239, 68, 68, 0.7)'; // red - more visible
            }

            const isHovered = hoveredGroup === group.id;
            const strokeWidth = isHovered 
              ? (orbitPaths.hoverStrokeWidth ?? orbitPaths.strokeWidth ?? 3)
              : (orbitPaths.strokeWidth ?? 2);
            const opacity = isHovered
              ? (orbitPaths.hoverOpacity ?? orbitPaths.opacity ?? 0.9)
              : (orbitPaths.opacity ?? 0.7);

            return (
              <g key={group.id}>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={group.radius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={orbitPaths.strokeDasharray === 'none' ? 'none' : (orbitPaths.strokeDasharray ?? '5,5')}
                  opacity={opacity}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => handleGroupHover(group, e)}
                  onMouseLeave={() => handleGroupHover(null)}
                  onClick={() => onGroupSelect?.(group)}
                />
              </g>
            );
          });
        })()}

        {dialTicks.map((tick) => (
          <g key={tick.index}>
            <line
              x1={tick.innerPos.x}
              y1={tick.innerPos.y}
              x2={tick.outerPos.x}
              y2={tick.outerPos.y}
              stroke={selectedDial === tick.index ? '#60a5fa' : '#555'}
              strokeWidth={selectedDial === tick.index ? 3 : 2}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.setAttribute('stroke', '#60a5fa');
              }}
              onMouseLeave={(e) => {
                if (selectedDial !== tick.index) {
                  e.currentTarget.setAttribute('stroke', '#555');
                }
              }}
              onClick={() => handleDialClick(tick.index)}
            />
          </g>
        ))}

        <circle
          cx={centerX}
          cy={centerY}
          r={centerRadius}
          fill="url(#centerGradient)"
          stroke={colors.center}
          strokeWidth={3}
        />

        {data.center.avatarUrl ? (
          <image
            href={data.center.avatarUrl}
            x={centerX - centerRadius + 10}
            y={centerY - centerRadius + 10}
            width={centerRadius * 2 - 20}
            height={centerRadius * 2 - 20}
            clipPath="circle()"
          />
        ) : null}

        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={16 * scaleFactor}
          fontWeight="bold"
        >
          {data.center.label}
        </text>
        {data.center.subtitle && (
          <text
            x={centerX}
            y={centerY + 20 * scaleFactor}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={10 * scaleFactor}
            opacity="0.7"
          >
            {data.center.subtitle}
          </text>
        )}

        {processedGroups.map((group) => {
          const orbitIndex = ('orbitIndex' in group ? group.orbitIndex : processedGroups.indexOf(group)) as number;
          
          // Check if any item in this group is hovered
          const hasHoveredItem = group.sortedItems.some(item => hoveredItem === item.id);
          
          return (
            <g
              key={group.id}
              style={{
                animation:
                  animation.orbitRotation
                    ? `rotate ${animation.orbitSpeedBase! * (orbitIndex % 2 === 0 ? 1 : -1)}s linear infinite`
                    : 'none',
                animationPlayState: animation.orbitRotation && hasHoveredItem ? 'paused' : (animation.orbitRotation ? 'running' : 'paused'),
                transformOrigin: `${centerX}px ${centerY}px`,
              }}
            >
            {group.sortedItems.map((item, itemIndex) => {
              const angle = group.angles[itemIndex];
              const pos = polarToCartesian(centerX, centerY, group.radius, angle);
              
              // Scale item radius based on container size
              const minItemRadius = 8 * scaleFactor;
              const maxItemRadius = 32 * scaleFactor;
              const itemRadius = valueToRadius(
                item.value,
                group.minValue,
                group.maxValue,
                minItemRadius,
                maxItemRadius
              );
              
              const isHovered = hoveredItem === item.id;
              const isGroupHovered = hoveredGroup === group.id;
              const scale =
                isHovered || isGroupHovered ? animation.hoverScale || 1.1 : 1;

              if (renderItem) {
                return (
                <foreignObject
                    key={item.id}
                    x={pos.x - itemRadius * 0.55}
                    y={pos.y - itemRadius * 0.55}
                    width={itemRadius * 1.1}
                    height={itemRadius * 1.1}
                    style={{
                      animation: 'fadeIn 0.5s ease-out',
                      animationDelay: `${itemIndex * 0.05}s`,
                      animationFillMode: 'backwards',
                    }}
                >
                    {renderItem({
                      item,
                      group,
                      position: pos,
                      radius: itemRadius,
                      angle,
                      isHovered,
                      isGroupHovered,
                      scale,
                      itemIndex,
                      groupIndex: orbitIndex,
                      centerX,
                      centerY,
                      onMouseEnter: (e) => handleItemHover(item, e),
                      onMouseLeave: () => handleItemHover(null),
                      onClick: () => onItemSelect?.(item, group),
                    })}
                  </foreignObject>
                );
              }

              return (
                <g
                  key={item.id}
                  style={{
                    animation: 'fadeIn 0.5s ease-out',
                    animationDelay: `${itemIndex * 0.05}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={itemRadius * scale}
                    fill={item.color || group.color || '#60a5fa'}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                    filter={item.glow ? 'url(#glow)' : 'none'}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isHovered ? 1 : 0.85,
                    }}
                    onMouseEnter={(e) => handleItemHover(item, e)}
                    onMouseLeave={() => handleItemHover(null)}
                    onClick={() => onItemSelect?.(item, group)}
                  />
                  {item.iconUrl && (
                    <image
                      href={item.iconUrl}
                      x={pos.x - itemRadius * 0.55}
                      y={pos.y - itemRadius * 0.55}
                      width={itemRadius * 1.1}
                      height={itemRadius * 1.1}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                  {isHovered && (
                    <text
                      x={pos.x}
                      y={pos.y + itemRadius + 15 * scaleFactor}
                      textAnchor="middle"
                      fill="white"
                      fontSize={11 * scaleFactor}
                      fontWeight="500"
                      style={{ pointerEvents: 'none' }}
                    >
                      {item.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          );
        })}
      </svg>

      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            zIndex: 50,
            pointerEvents: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            color: 'white',
            left: tooltip.x + 15,
            top: tooltip.y + 15,
            backgroundColor: colors.tooltip,
          }}
        >
          {tooltip.content}
        </div>
      )}

      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default RadialOrbit;
