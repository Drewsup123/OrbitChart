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
  const centerRadius = 60;
  const dialRadius = centerRadius + 40;
  const baseOrbitRadius = dialRadius + 60;
  const orbitSpacing = 120;

  const processedGroups = useMemo(() => {
    return data.groups.map((group, index) => {
      const sortedItems = sortItems(group.items, sortableBy);
      const radius = group.radius || baseOrbitRadius + index * orbitSpacing;

      const allValues = sortedItems.map((item) => item.value);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);

      const angles = distributeAngles(sortedItems.length);

      return {
        ...group,
        sortedItems,
        radius,
        minValue,
        maxValue,
        angles,
      };
    });
  }, [data.groups, sortableBy, baseOrbitRadius, orbitSpacing]);

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
          overflow: 'visible',
        }}
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

        {processedGroups.map((group) => (
          <g key={group.id}>
            <circle
              cx={centerX}
              cy={centerY}
              r={group.radius}
              fill="none"
              stroke={colors.ring}
              strokeWidth={hoveredGroup === group.id ? 2 : 1}
              strokeDasharray="5,5"
              opacity={hoveredGroup === group.id ? 0.6 : 0.3}
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => handleGroupHover(group, e)}
              onMouseLeave={() => handleGroupHover(null)}
              onClick={() => onGroupSelect?.(group)}
            />
          </g>
        ))}

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
          fontSize="16"
          fontWeight="bold"
        >
          {data.center.label}
        </text>
        {data.center.subtitle && (
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="10"
            opacity="0.7"
          >
            {data.center.subtitle}
          </text>
        )}

        {processedGroups.map((group, groupIndex) => (
          <g
            key={group.id}
            style={{
              animation:
                animation.orbitRotation
                  ? `rotate ${animation.orbitSpeedBase! * (groupIndex % 2 === 0 ? 1 : -1)}s linear infinite`
                  : 'none',
              transformOrigin: `${centerX}px ${centerY}px`,
            }}
          >
            {group.sortedItems.map((item, itemIndex) => {
              const angle = group.angles[itemIndex];
              const pos = polarToCartesian(centerX, centerY, group.radius, angle);
              const itemRadius = valueToRadius(
                item.value,
                group.minValue,
                group.maxValue
              );
              const isHovered = hoveredItem === item.id;
              const isGroupHovered = hoveredGroup === group.id;
              const scale =
                isHovered || isGroupHovered ? animation.hoverScale || 1.1 : 1;

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
                      y={pos.y + itemRadius + 15}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
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
        ))}
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
