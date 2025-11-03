import React, { useState, useMemo } from 'react';
import { PerformanceEntry } from '../types';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData as ChartJsData,
} from 'chart.js';
import clsx from 'clsx';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PlayerViewProps {
  data: PerformanceEntry[];
  playerNames: string[];
}

const StatCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={clsx("bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-4 flex flex-col justify-center", className)}>
        {children}
    </div>
);

const PlayerView: React.FC<PlayerViewProps> = ({ data, playerNames }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>(playerNames[0] || '');

  const { playerEntries, playerStats } = useMemo(() => {
    if (!selectedPlayer) return { playerEntries: [], playerStats: null };

    const entries = data
      .filter(entry => entry.name === selectedPlayer)
      .map(playerEntry => {
        const drillScores = data
          .filter(d => d.drill === playerEntry.drill)
          .map(d => d.score);
        
        const uniqueSortedScores = [...new Set(drillScores)].sort((a, b) => Number(b) - Number(a));
        
        const rank = uniqueSortedScores.indexOf(playerEntry.score) + 1;

        return { ...playerEntry, rank };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dob = entries.length > 0 ? entries[0].dob : null;
    let age: { years: number; months: number } | 'N/A' = 'N/A';
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      age = { years, months };
    }

    return {
      playerEntries: entries,
      playerStats: {
        age: age,
        totalEntries: entries.length
      }
    };
  }, [selectedPlayer, data]);

  const timeSeriesChartData = useMemo<ChartJsData<'line'>>(() => {
    if (!playerEntries || playerEntries.length === 0) {
        return { datasets: [] };
    }
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];
    const drillsData: Record<string, {x: number; y: number}[]> = {};
    
    playerEntries.forEach(entry => {
        if (!drillsData[entry.drill]) {
            drillsData[entry.drill] = [];
        }
        drillsData[entry.drill].push({ x: new Date(entry.date).getTime(), y: entry.score });
    });

    return {
        datasets: Object.keys(drillsData).map((drillName, index) => ({
            label: drillName,
            data: drillsData[drillName].sort((a,b) => a.x - b.x),
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}33`,
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
        }))
    }
  }, [playerEntries]);

  const timeSeriesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                color: '#cbd5e1', // slate-300
                font: {
                    size: 12
                },
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
        },
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'day',
                tooltipFormat: 'MMM d, yyyy',
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#cbd5e1',
            },
            border: { display: false }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#cbd5e1',
            },
            border: { display: false }
        }
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  }

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Player Deep Dive</h2>
        <div className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-4">
            <label htmlFor="player-select" className="block text-sm font-medium text-slate-300 mb-2">
                Select Player
            </label>
            <select
                id="player-select"
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                className="w-full md:w-1/2 lg:w-1/3 bg-black/30 text-white border border-white/10 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {playerNames.map(name => (
                <option key={name} value={name}>
                    {name}
                </option>
                ))}
            </select>
        </div>
        
        {playerStats && (
            <div className="grid grid-cols-2 gap-4">
               <StatCard className="text-left">
                    <p className="text-sm text-slate-400">Age</p>
                    {playerStats.age === 'N/A' 
                        ? <p className="text-2xl font-bold text-white">N/A</p>
                        : (
                            <div>
                                <p className="text-2xl font-bold text-white">{playerStats.age.years} Jahre</p>
                                <p className="text-lg font-medium text-slate-300">{playerStats.age.months} Monate</p>
                            </div>
                        )
                    }
               </StatCard>
               <StatCard className="text-center">
                    <p className="text-xl font-bold text-white uppercase tracking-wider">{selectedPlayer}</p>
                    <p className="text-3xl font-bold text-slate-200 mt-1">{playerStats.totalEntries}</p>
                    <p className="text-xs text-slate-400 uppercase mt-1">Entries</p>
               </StatCard>
            </div>
        )}
        
        {playerEntries.length > 0 && (
            <div className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold text-white mb-4">Performance Over Time</h3>
                <div className="relative h-96">
                    <Line options={timeSeriesChartOptions} data={timeSeriesChartData} />
                </div>
            </div>
        )}

        <div className="overflow-hidden bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl">
            <h3 className="text-xl font-bold text-white p-4">Performance History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-slate-300">
                  <thead className="bg-white/5 text-xs text-slate-200 uppercase tracking-wider">
                      <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Drill</th>
                          <th scope="col" className="px-6 py-3 text-center">Rank</th>
                          <th scope="col" className="px-6 py-3 text-right">Score</th>
                      </tr>
                  </thead>
                  <tbody>
                      {playerEntries.map((entry, index) => (
                          <tr key={`${entry.date}-${entry.drill}-${index}`} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono whitespace-nowrap">{entry.date}</td>
                              <td className="px-6 py-4 font-semibold">{entry.drill}</td>
                              <td className="px-6 py-4 text-center font-bold text-xl">{getRankDisplay(entry.rank)}</td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-white">{entry.score}</td>
                          </tr>
                      ))}
                       {playerEntries.length === 0 && (
                          <tr>
                              <td colSpan={4} className="text-center py-8 text-slate-400">No data available for the selected player.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
            </div>
        </div>
    </div>
  );
};

export default PlayerView;