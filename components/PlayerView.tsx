import React, { useState, useMemo } from 'react';
import { PerformanceEntry } from '../types';

interface PlayerViewProps {
  data: PerformanceEntry[];
  playerNames: string[];
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
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
        
        // FIX: Explicitly cast to Number to prevent type errors during subtraction.
        const uniqueSortedScores = [...new Set(drillScores)].sort((a, b) => Number(b) - Number(a));
        
        const rank = uniqueSortedScores.indexOf(playerEntry.score) + 1;

        return { ...playerEntry, rank };
      })
      // FIX: Use getTime() for robust date comparison to prevent type errors.
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dob = entries.length > 0 ? entries[0].dob : null;
    let age = 'N/A';
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      age = `${years}y, ${months}m`;
    }

    return {
      playerEntries: entries,
      playerStats: {
        age: age,
        totalEntries: entries.length
      }
    };
  }, [selectedPlayer, data]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  }

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Player Deep Dive</h2>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <label htmlFor="player-select" className="block text-sm font-medium text-gray-300 mb-2">
                Select Player
            </label>
            <select
                id="player-select"
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                className="w-full md:w-1/2 lg:w-1/3 bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
               <StatCard title="Age" value={playerStats.age} />
               <StatCard title="Entries" value={playerStats.totalEntries} />
            </div>
        )}

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700 text-xs text-gray-300 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Drill</th>
                        <th scope="col" className="px-6 py-3 text-center">Rank</th>
                        <th scope="col" className="px-6 py-3 text-right">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {playerEntries.map((entry, index) => (
                        <tr key={`${entry.date}-${entry.drill}-${index}`} className="border-b border-gray-700 hover:bg-gray-600/50 transition-colors">
                            <td className="px-6 py-4 font-mono whitespace-nowrap">{entry.date}</td>
                            <td className="px-6 py-4 font-semibold">{entry.drill}</td>
                            <td className="px-6 py-4 text-center font-bold text-xl">{getRankDisplay(entry.rank)}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-white">{entry.score}</td>
                        </tr>
                    ))}
                     {playerEntries.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500">No data available for the selected player.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default PlayerView;