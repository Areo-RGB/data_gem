import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PerformanceEntry, ChartData } from '../types';
import DrillChart from './DrillChart';
import ThinkingModeToggle from './ThinkingModeToggle';
import AnalysisCard from './AnalysisCard';
import { analyzePerformanceData } from '../services/geminiService';

interface DashboardProps {
  data: PerformanceEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [thinkingMode, setThinkingMode] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenDrill, setFullscreenDrill] = useState<string | null>(null);

  const drillData = useMemo(() => {
    const drills: Record<string, ChartData[]> = {};
    const uniqueDrills = data
      .map(entry => entry.drill)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();

    uniqueDrills.forEach(drillName => {
      const entriesForDrill = data.filter(entry => entry.drill === drillName);
      if (entriesForDrill.length === 0) return;

      const totalScore = entriesForDrill.reduce((sum, entry) => sum + entry.score, 0);
      const averageScore = parseFloat((totalScore / entriesForDrill.length).toFixed(2));

      drills[drillName] = entriesForDrill
        .map(entry => ({
          player: entry.name,
          score: entry.score,
          average: averageScore,
        }))
        .sort((a, b) => b.score - a.score);
    });

    return drills;
  }, [data]);

  const handleAnalysis = useCallback(async () => {
    setIsLoading(true);
    setAnalysis('');
    const result = await analyzePerformanceData(data, thinkingMode);
    setAnalysis(result);
    setIsLoading(false);
  }, [data, thinkingMode]);

  const handleChartDoubleClick = useCallback((drillName: string) => {
    setFullscreenDrill(drillName);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenDrill(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseFullscreen]);

  const fullscreenChartData = fullscreenDrill ? drillData[fullscreenDrill] : null;


  return (
    <div className="space-y-8">
      <div className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
                 <h2 className="text-2xl sm:text-3xl font-bold text-white">Performance Analysis</h2>
                 <p className="text-slate-300 mt-1">AI-powered insights into team performance.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                 <ThinkingModeToggle enabled={thinkingMode} onChange={setThinkingMode} />
                 <button 
                    onClick={handleAnalysis}
                    disabled={isLoading}
                    className="flex-grow sm:flex-grow-0 px-4 py-2 sm:px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                 >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                 </button>
            </div>
        </div>
      </div>

      <AnalysisCard analysis={analysis} isLoading={isLoading} />

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Drill Leaderboards</h2>
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(drillData).map(([drillName, chartData]) => (
            <DrillChart 
                key={drillName} 
                drillName={drillName} 
                data={chartData}
                onDoubleClick={handleChartDoubleClick}
            />
          ))}
        </div>
      </div>

      {fullscreenDrill && fullscreenChartData && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={handleCloseFullscreen}
        >
            <div 
                className="w-full h-full max-w-7xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <DrillChart 
                    drillName={fullscreenDrill} 
                    data={fullscreenChartData} 
                    isFullscreen={true} 
                />
                <button 
                    onClick={handleCloseFullscreen}
                    className="absolute top-3 right-3 text-gray-300 hover:text-white z-20"
                    aria-label="Close fullscreen view"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <use href="#close-icon" />
                    </svg>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;