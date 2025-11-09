import type { RadialOrbitItem } from '../types/radial-orbit';

export const valueToRadius = (
  value: number,
  minValue: number,
  maxValue: number,
  minRadius: number = 8,
  maxRadius: number = 32
): number => {
  if (maxValue === minValue) return (minRadius + maxRadius) / 2;
  const normalized = (value - minValue) / (maxValue - minValue);
  return minRadius + normalized * (maxRadius - minRadius);
};

export const sortItems = (
  items: RadialOrbitItem[],
  sortBy?: 'value' | 'label' | ((a: RadialOrbitItem, b: RadialOrbitItem) => number)
): RadialOrbitItem[] => {
  if (!sortBy) return items;

  if (typeof sortBy === 'function') {
    return [...items].sort(sortBy);
  }

  if (sortBy === 'value') {
    return [...items].sort((a, b) => b.value - a.value);
  }

  if (sortBy === 'label') {
    return [...items].sort((a, b) => a.label.localeCompare(b.label));
  }

  return items;
};

export const distributeAngles = (count: number, startAngle: number = 0): number[] => {
  if (count === 0) return [];
  if (count === 1) return [startAngle];

  const angleStep = (Math.PI * 2) / count;
  return Array.from({ length: count }, (_, i) => startAngle + i * angleStep);
};

export const distributeAnglesGrouped = (
  count: number,
  groupIndex: number,
  totalGroups: number,
  startAngle: number = 0
): number[] => {
  if (count === 0) return [];
  if (count === 1) return [startAngle];

  // Calculate the sector size for this group
  const sectorSize = (Math.PI * 2) / totalGroups;
  const sectorStart = startAngle + groupIndex * sectorSize;
  
  // Distribute items within the sector, leaving some padding
  const padding = sectorSize * 0.1; // 10% padding on each side
  const availableAngle = sectorSize - padding * 2;
  const angleStep = count > 1 ? availableAngle / (count - 1) : 0;
  
  return Array.from({ length: count }, (_, i) => 
    sectorStart + padding + i * angleStep
  );
};

export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number
): { x: number; y: number } => {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};
