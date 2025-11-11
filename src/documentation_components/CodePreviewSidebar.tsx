import React from 'react';
import type { ItemShape } from '../types/radial-orbit';

interface CodePreviewSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chartSize: { width: number; height: number };
  animation: {
    orbitRotation: boolean;
    orbitSpeedBase: number;
    hoverScale: number;
    orbits?: string[];
    dataLoadedAnimation?: 'sides' | 'center' | 'none';
  };
  itemShape: ItemShape;
  groupBy: boolean;
  groupOrbits: string[][] | undefined;
  orbitPaths: {
    show: boolean;
    strokeWidth: number;
    strokeDasharray: string;
    opacity: number;
    hoverStrokeWidth: number;
    hoverOpacity: number;
  };
  colors: {
    background: string;
    ring: string;
    center: string;
    tooltip: string;
  };
  hasCustomRenderer?: boolean;
  showCustomRenderer?: boolean;
}

const CodePreviewSidebar: React.FC<CodePreviewSidebarProps> = ({
  isOpen,
  onClose,
  chartSize,
  animation,
  itemShape,
  groupBy,
  groupOrbits,
  orbitPaths,
  colors,
  hasCustomRenderer = false,
  showCustomRenderer = false,
}) => {
  const generateCodePreview = (): string => {
    const props: string[] = [];

    // Data prop (always present)
    props.push(`  data={data}`);

    // Size props
    if (chartSize.width !== 800) {
      props.push(`  width={${chartSize.width}}`);
    }
    if (chartSize.height !== 800) {
      props.push(`  height={${chartSize.height}}`);
    }

    // SortableBy
    props.push(`  sortableBy="value"`);

    // Event handlers
    props.push(`  onGroupSelect={handleGroupSelect}`);
    props.push(`  onItemSelect={handleItemSelect}`);
    props.push(`  onDialSelect={handleDialSelect}`);

    // Item shape
    if (itemShape !== 'circle') {
      props.push(`  itemShape="${itemShape}"`);
    }

    // Custom renderer
    if (hasCustomRenderer || showCustomRenderer) {
      props.push(`  renderItem={customItemRenderer}`);
    }

    // Animation props
    const animationProps: string[] = [];
    if (!animation.orbitRotation) {
      animationProps.push(`    orbitRotation: false`);
    }
    if (animation.orbitSpeedBase !== 60) {
      animationProps.push(`    orbitSpeedBase: ${animation.orbitSpeedBase}`);
    }
    if (animation.hoverScale !== 1.1) {
      animationProps.push(`    hoverScale: ${animation.hoverScale}`);
    }
    if (animation.orbits !== undefined) {
      if (animation.orbits.length === 0) {
        animationProps.push(`    orbits: []`);
      } else {
        animationProps.push(`    orbits: [${animation.orbits.map(id => `'${id}'`).join(', ')}]`);
      }
    }
    if (animation.dataLoadedAnimation && animation.dataLoadedAnimation !== 'sides') {
      animationProps.push(`    dataLoadedAnimation: '${animation.dataLoadedAnimation}'`);
    }
    
    if (animationProps.length > 0) {
      props.push(`  animation={{`);
      props.push(...animationProps);
      props.push(`  }}`);
    }

    // GroupBy
    if (groupBy) {
      props.push(`  groupBy={true}`);
    }

    // GroupOrbits
    if (groupOrbits !== undefined) {
      if (groupOrbits.length === 0) {
        props.push(`  groupOrbits={[]}`);
      } else {
        const orbitsStr = groupOrbits
          .map(orbit => {
            if (orbit.length === 0) {
              return '[]';
            }
            return `[${orbit.map(id => `'${id}'`).join(', ')}]`;
          })
          .join(', ');
        props.push(`  groupOrbits={[${orbitsStr}]}`);
      }
    }

    // OrbitPaths
    const orbitPathProps: string[] = [];
    if (!orbitPaths.show) {
      orbitPathProps.push(`    show: false`);
    }
    if (orbitPaths.strokeWidth !== 2) {
      orbitPathProps.push(`    strokeWidth: ${orbitPaths.strokeWidth}`);
    }
    if (orbitPaths.strokeDasharray !== '5,5') {
      orbitPathProps.push(`    strokeDasharray: '${orbitPaths.strokeDasharray}'`);
    }
    if (orbitPaths.opacity !== 0.7) {
      orbitPathProps.push(`    opacity: ${orbitPaths.opacity}`);
    }
    if (orbitPaths.hoverStrokeWidth !== 3) {
      orbitPathProps.push(`    hoverStrokeWidth: ${orbitPaths.hoverStrokeWidth}`);
    }
    if (orbitPaths.hoverOpacity !== 0.9) {
      orbitPathProps.push(`    hoverOpacity: ${orbitPaths.hoverOpacity}`);
    }

    if (orbitPathProps.length > 0) {
      props.push(`  orbitPaths={{`);
      props.push(...orbitPathProps);
      props.push(`  }}`);
    }

    // Colors
    const colorProps: string[] = [];
    if (colors.background !== 'rgba(0, 0, 0, 0.05)') {
      colorProps.push(`    background: '${colors.background}'`);
    }
    if (colors.ring !== 'rgba(100, 100, 100, 0.2)') {
      colorProps.push(`    ring: '${colors.ring}'`);
    }
    if (colors.center !== '#1a1a1a') {
      colorProps.push(`    center: '${colors.center}'`);
    }
    if (colors.tooltip !== 'rgba(0, 0, 0, 0.9)') {
      colorProps.push(`    tooltip: '${colors.tooltip}'`);
    }

    if (colorProps.length > 0) {
      props.push(`  colors={{`);
      props.push(...colorProps);
      props.push(`  }}`);
    }

    return `<RadialOrbit\n${props.join('\n')}\n/>`;
  };

  const code = generateCodePreview();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        width: '500px',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderLeft: '1px solid rgba(51, 65, 85, 1)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid rgba(51, 65, 85, 1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          Code Preview
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(51, 65, 85, 1)',
            color: '#cbd5e1',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid rgba(51, 65, 85, 1)',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            RadialOrbit Component
          </div>
          <pre
            style={{
              margin: 0,
              padding: 0,
              color: '#cbd5e1',
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: 'Monaco, "Courier New", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{code}</code>
          </pre>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(96, 165, 250, 0.2)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: '6px',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
          }}
        >
          Copy Code
        </button>

        {/* Info */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          <strong style={{ color: '#60a5fa' }}>Note:</strong> This preview shows only non-default props. 
          Default values are omitted for cleaner code. Make sure to import RadialOrbit and define your data, 
          event handlers, and any custom renderers.
        </div>
      </div>
    </div>
  );
};

export default CodePreviewSidebar;

