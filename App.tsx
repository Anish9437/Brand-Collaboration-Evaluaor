import React, { useState } from 'react';
import { DEFAULT_PARAMETERS, TRACXN_API_KEY } from './constants';
import { ScoringParameter, AnalysisResult, AnalysisRequest } from './types';
import WeightAdjuster from './components/WeightAdjuster';
import ResultsView from './components/ResultsView';
import { fetchBrandData } from './services/tracxnService';
import { generateAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [weights, setWeights] = useState<ScoringParameter[]>(DEFAULT_PARAMETERS);
  
  // Form State
  const [brandA, setBrandA] = useState('Blue Tokai');
  const [brandB, setBrandB] = useState('Oatly');
  const [scope, setScope] = useState('Co-branded product & Distribution');
  const [geography, setGeography] = useState('India / SE Asia');
  const [tracxnKey, setTracxnKey] = useState(TRACXN_API_KEY);
  
  // App State
  const [loading, setLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{a: boolean; b: boolean} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setFetchStatus(null);

    try {
      // 1. Fetch Data (if key available)
      const tKey = tracxnKey || process.env.REACT_APP_TRACXN_API_KEY || '';
      
      // Start fetch
      const [dataA, dataB] = await Promise.all([
        fetchBrandData(brandA, tKey),
        fetchBrandData(brandB, tKey)
      ]);

      setFetchStatus({
        a: !!dataA,
        b: !!dataB
      });

      // 2. Prepare Request for Gemini
      const weightMap: Record<string, number> = {};
      weights.forEach(w => weightMap[w.name] = w.weight);

      const request: AnalysisRequest = {
        brandA,
        brandB,
        scope,
        geography,
        weights: weightMap,
        apiKey: process.env.API_KEY || '',
        tracxnKey: tKey
      };

      // 3. Call Gemini
      const analysis = await generateAnalysis(request, dataA, dataB);
      setResult(analysis);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Synergy<span className="text-indigo-600">AI</span></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 border border-green-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live Market Data</span>
              </div>
              <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
                Strategy Consultant Mode
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs">1</span>
                Assessment Scope
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Brand A</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={brandA}
                        onChange={(e) => setBrandA(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all pl-8"
                        placeholder="e.g. Nike"
                      />
                      <div className="absolute left-2.5 top-2.5 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                    </div>
                   </div>
                   <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Brand B</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={brandB}
                        onChange={(e) => setBrandB(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all pl-8"
                        placeholder="e.g. Apple"
                      />
                      <div className="absolute left-2.5 top-2.5 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                    </div>
                   </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Geographic Focus</label>
                  <input 
                    type="text" 
                    value={geography}
                    onChange={(e) => setGeography(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Collaboration Scope</label>
                  <textarea 
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none"
                    placeholder="e.g. Co-branded product line"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <div className="flex justify-between items-center">
                     <label className="text-xs font-semibold text-slate-400 uppercase">Tracxn API Key</label>
                     <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Active</span>
                   </div>
                   <input 
                      type="password" 
                      value={tracxnKey}
                      onChange={(e) => setTracxnKey(e.target.value)}
                      placeholder="Enter API Key"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 focus:outline-none"
                    />
                </div>
              </div>
            </div>

            {/* Weights Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
               <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs">2</span>
                Adjust Framework
              </h2>
              <WeightAdjuster weights={weights} setWeights={setWeights} />
            </div>

            {/* Action Button */}
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching Live Data...
                </span>
              ) : (
                "Generate Strategic Analysis"
              )}
            </button>
            
            {fetchStatus && (
              <div className="flex gap-2 justify-center text-[10px] text-slate-400">
                <span className={fetchStatus.a ? 'text-green-600 font-bold' : 'text-slate-400'}>
                  {fetchStatus.a ? '✓' : '•'} {brandA} Data
                </span>
                <span>|</span>
                <span className={fetchStatus.b ? 'text-green-600 font-bold' : 'text-slate-400'}>
                  {fetchStatus.b ? '✓' : '•'} {brandB} Data
                </span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!result && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[500px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p className="text-lg font-medium">Ready to analyze partnership potential.</p>
                <p className="text-sm">Enter brands and configure weights to begin.</p>
              </div>
            )}

            {result && <ResultsView result={result} />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;