import React, { useState } from 'react';
import { PLAYER_INFO } from '../constants';
import { addPerformanceEntry, NewPerformanceEntryData } from '../services/firebase';

interface AddResultProps {
  playerNames: string[];
}

const DRILLS = [
    "Yo-Yo IR1",
    "Springseil", // Jump Rope
    "Prellwand", // Rebound Wall
    "Jonglieren" // Juggling
];
const UNITS: Record<string, string> = {
    "Yo-Yo IR1": "Distance",
    "Springseil": "Jumps",
    "Prellwand": "Hits",
    "Jonglieren": "Reps"
};

const AddResult: React.FC<AddResultProps> = ({ playerNames }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const [name, setName] = useState(playerNames[0] || '');
    const [drill, setDrill] = useState(DRILLS[0]);
    const [score, setScore] = useState('');
    const [date, setDate] = useState(today);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !drill || !score || !date) {
            setMessage({ type: 'error', text: 'Please fill out all fields.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        const newEntry: NewPerformanceEntryData = {
            date,
            name,
            team: "4.D", // Assuming a default team for now
            drill,
            score: Number(score),
            units: UNITS[drill] || 'N/A',
            notes: '',
        };

        try {
            await addPerformanceEntry(newEntry);
            setMessage({ type: 'success', text: 'Result saved successfully!' });
            setScore('');
            setDate(today);
            setName(playerNames[0] || '');
            setDrill(DRILLS[0]);

        } catch (error) {
            console.error("Failed to save result:", error);
            setMessage({ type: 'error', text: 'Failed to save result. Please try again.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">Log New Performance Result</h2>
            <form onSubmit={handleSubmit} className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-6 space-y-6">
                
                <div>
                    <label htmlFor="player-name" className="block text-sm font-medium text-slate-300 mb-2">
                        Player Name
                    </label>
                    <select
                        id="player-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/30 text-white border border-white/10 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {playerNames.map(playerName => (
                            <option key={playerName} value={playerName}>{PLAYER_INFO[playerName as keyof typeof PLAYER_INFO].fullName}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="drill" className="block text-sm font-medium text-slate-300 mb-2">
                        Drill
                    </label>
                    <select
                        id="drill"
                        value={drill}
                        onChange={e => setDrill(e.target.value)}
                        className="w-full bg-black/30 text-white border border-white/10 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {DRILLS.map(drillName => (
                            <option key={drillName} value={drillName}>{drillName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="score" className="block text-sm font-medium text-slate-300 mb-2">
                        Score
                    </label>
                    <input
                        type="number"
                        id="score"
                        value={score}
                        onChange={e => setScore(e.target.value)}
                        className="w-full bg-black/30 text-white border border-white/10 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-500"
                        placeholder={`e.g., for ${drill} in ${UNITS[drill]}`}
                    />
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-black/30 text-white border border-white/10 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSaving ? 'Saving...' : 'Save Result'}
                    </button>
                </div>

                {message && (
                    <div className={`text-center p-3 rounded-md ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddResult;