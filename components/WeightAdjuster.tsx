import React from 'react';
import { ScoringParameter } from '../types';

interface Props {
  weights: ScoringParameter[];
  setWeights: (weights: ScoringParameter[]) => void;
}

const WeightAdjuster: React.FC<Props> = ({ weights, setWeights }) => {
  const handleChange = (id: string, newVal: number) => {
    const updated = weights.map(p => p.id === id ? { ...p, weight: newVal } : p);
    setWeights(updated);
  };

  const totalWeight = weights.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Strategic Priorities (Weights)</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          Total: {totalWeight}/100
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {weights.map((param) => (
          <div key={param.id} className="flex items-center space-x-4">
            <label className="flex-1 text-xs text-slate-600 font-medium truncate" title={param.name}>
              {param.name}
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={param.weight}
              onChange={(e) => handleChange(param.id, parseInt(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="w-8 text-right text-xs font-mono text-slate-500">{param.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightAdjuster;
