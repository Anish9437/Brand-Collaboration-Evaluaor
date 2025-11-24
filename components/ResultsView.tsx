import React from 'react';
import { AnalysisResult } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

interface Props {
  result: AnalysisResult;
}

const ResultsView: React.FC<Props> = ({ result }) => {
  const chartData = result.parameters.map(p => ({
    subject: p.name.split(" ")[0], // Short name for chart
    fullSubject: p.name,
    score: p.rating || 0,
    fullMark: 5
  }));

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'Go': return 'bg-green-500 text-white';
      case 'Pilot': return 'bg-amber-500 text-white';
      default: return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Synergy Score</h2>
          <div className="text-6xl font-black text-slate-800 tracking-tighter">
            {result.finalPercentage}<span className="text-2xl text-slate-400">%</span>
          </div>
          <div className={`mt-4 px-6 py-2 rounded-full text-sm font-bold shadow-md uppercase tracking-wide ${getRecColor(result.recommendation)}`}>
            Recommendation: {result.recommendation}
          </div>
          <p className="mt-4 text-xs text-center text-slate-400">
            Model: {result.suggestedModel}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Executive Summary</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            {result.executiveSummary}
          </p>
        </div>
      </div>

      {/* Detailed Analysis & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Fit Profile</h4>
           <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                 <PolarGrid stroke="#e2e8f0" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                 <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                 <Tooltip />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Table */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Parameter</th>
                  <th className="px-6 py-3 text-center">Weight</th>
                  <th className="px-6 py-3 text-center">Rating (1-5)</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.parameters.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-6 py-3 text-center text-slate-500">{p.weight}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                        (p.rating || 0) >= 4 ? 'bg-green-100 text-green-700' :
                        (p.rating || 0) >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.rating}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center font-mono text-slate-600">{p.weightedScore?.toFixed(1)}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs italic">{p.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Concepts & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Proposed Concepts</h3>
          <div className="space-y-4">
            {result.concepts.map((concept, idx) => (
              <div key={idx} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-semibold text-indigo-900 text-sm mb-1">{concept.title}</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">{concept.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">Key Risks & Mitigations</h3>
           <ul className="space-y-3">
             {result.risks.map((risk, idx) => (
               <li key={idx} className="flex flex-col text-sm pb-3 border-b border-slate-50 last:border-0">
                 <span className="font-semibold text-slate-700 text-xs mb-1">⚠️ {risk.risk}</span>
                 <span className="text-slate-500 text-xs pl-5">↳ Mitigation: {risk.mitigation}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>

      {/* Footer / Sources */}
      <div className="text-center text-xs text-slate-400 pt-8 pb-12">
        <p className="font-semibold mb-1">Sources utilized for this analysis:</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {result.sources.map((src, idx) => (
            <span key={idx} className="bg-slate-100 px-2 py-1 rounded">{src}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
