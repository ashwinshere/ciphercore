import React from 'react';
import { Layers3 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

/**
 * Toggle button that drives the exploded-view animation in BuildingScene.
 * The actual per-floor vertical offset animation lives in BuildingFloor.jsx
 * (smoothly lerping to `idx * EXPLODE_GAP` whenever `explodedView` flips),
 * this component is just the control surface for that shared state.
 */
export default function ExplodedViewController({ className = '' }) {
  const { explodedView, setExplodedView } = useApp();

  return (
    <button
      onClick={() => setExplodedView((v) => !v)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        explodedView
          ? 'bg-vertex-cyan/20 border-vertex-cyan text-vertex-cyan shadow-glow'
          : 'glass border-vertex-border text-slate-200 hover:border-vertex-cyan/50'
      } ${className}`}
    >
      <Layers3 size={13} /> {explodedView ? 'Exploded View: On' : 'Exploded View'}
    </button>
  );
}
