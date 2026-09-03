import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ConflictPanel() {
  // Spatial Audit cleared view
  return (
    <div className="gov-card p-6 flex flex-col items-center justify-center gap-4 text-cipher-navy">
      <CheckCircle2 size={48} className="text-emerald-600" />
      <h2 className="text-xl font-extrabold">Spatial Audit Cleared</h2>
      <p className="text-sm text-cipher-muted">All cadastral properties have passed the spatial audit with no issues.</p>
    </div>
  );
}
