import React from 'react';
import { Layers } from 'lucide-react';
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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        explodedView
          ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
          : 'bg-white border-cipher-border text-cipher-navy hover:bg-slate-50 hover:border-slate-300 shadow-subtle'
      } ${className}`}
    >
      <Layers size={13} className={explodedView ? 'text-white' : 'text-cipher-govblue'} />
      {explodedView ? 'Assemble Building' : 'Exploded View'}
    </button>
  );
}
