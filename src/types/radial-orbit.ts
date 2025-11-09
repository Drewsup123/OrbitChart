/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CSSProperties } from 'react';

export type RadialOrbitItem = {
  id: string;
  label: string;
  value: number;
  color?: string;
  glow?: boolean;
  iconUrl?: string;
  meta?: Record<string, any>;
};

export type RadialOrbitGroup = {
  id: string;
  label: string;
  items: RadialOrbitItem[];
  radius?: number;
  color?: string;
};

export type RadialOrbitData = {
  center: {
    id: string;
    label: string;
    subtitle?: string;
    avatarUrl?: string;
  };
  groups: RadialOrbitGroup[];
};

export type RadialOrbitProps = {
  data: RadialOrbitData;
  width?: number;
  height?: number;
  sortableBy?: 'value' | 'label' | ((a: RadialOrbitItem, b: RadialOrbitItem) => number);
  onGroupSelect?: (group: RadialOrbitGroup) => void;
  onItemSelect?: (item: RadialOrbitItem, group: RadialOrbitGroup) => void;
  onDialSelect?: (index: number) => void;
  animation?: {
    orbitRotation?: boolean;
    orbitSpeedBase?: number;
    hoverScale?: number;
  };
  colors?: {
    background?: string;
    ring?: string;
    center?: string;
    tooltip?: string;
  };
  style?: CSSProperties;
};
