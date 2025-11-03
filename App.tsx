import React, { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { PLAYER_INFO } from './constants';
import { PerformanceEntry } from './types';
import Dashboard from './components/Dashboard';
import PlayerView from './components/PlayerView';
import AddResult from './components/AddResult';
import { listenForPerformanceEntries, seedDatabase, FirebasePermissionError } from './services/firebase';
import FirebasePermissionErrorModal from './components/FirebasePermissionErrorModal';

type View = 'dashboard' | 'playerView' | 'addResult';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [performanceEntries, setPerformanceEntries] = useState<(string | number)[][]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const initializeDb = async () => {
      try {
        await seedDatabase();
        unsubscribe = listenForPerformanceEntries(data => {
            setPerformanceEntries(data);
        });
      } catch (error) {
        if (error instanceof FirebasePermissionError) {
            setDbError(error.message);
        } else {
            setDbError("An unexpected error occurred while connecting to the database.");
            console.error(error);
        }
      }
    };
    
    initializeDb();

    return () => unsubscribe();
  }, []);

  const processedData = useMemo<PerformanceEntry[]>(() => {
    return performanceEntries.map(
      ([date, firstName, team, drill, score, units, notes]) => {
        const player = PLAYER_INFO[firstName as keyof typeof PLAYER_INFO];
        return {
          date: String(date),
          name: String(firstName),
          dob: player ? player.dob : 'N/A',
          team: String(team),
          drill: String(drill),
          score: Number(score),
          units: String(units),
          notes: notes ? String(notes) : '',
        };
      }
    ).filter(entry => entry.dob !== 'N/A');
  }, [performanceEntries]);

  const playerNames = useMemo(() => {
    return Object.keys(PLAYER_INFO).sort();
  }, []);

  const handleViewChange = (view: View) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false); // Close mobile menu on larger screens
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (dbError) {
    return <FirebasePermissionErrorModal />;
  }

  const SidebarContent: React.FC = () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Analytics</h1>
      <nav>
        <ul>
          <li>
            <button
              onClick={() => handleViewChange('dashboard')}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-md transition-colors duration-200 text-slate-200',
                activeView === 'dashboard'
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'hover:bg-white/10'
              )}
            >
              Drill Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => handleViewChange('playerView')}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-md transition-colors duration-200 text-slate-200',
                activeView === 'playerView'
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'hover:bg-white/10'
              )}
            >
              Player View
            </button>
          </li>
          <li>
            <button
              onClick={() => handleViewChange('addResult')}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-md transition-colors duration-200 text-slate-200',
                activeView === 'addResult'
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'hover:bg-white/10'
              )}
            >
              Add Result
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Header for mobile */}
      <header className="md:hidden bg-black/30 backdrop-blur-lg border-b border-white/10 text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">Analytics</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-30">
          <svg className="w-6 h-6" stroke="currentColor" fill="none">
            <use href={isMenuOpen ? "#close-icon" : "#menu-icon"} />
          </svg>
        </button>
      </header>
      
      {/* Sidebar for desktop */}
      <aside className="hidden md:block w-56 bg-black/30 backdrop-blur-lg border-r border-white/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <div 
        className={clsx(
          "md:hidden fixed inset-0 bg-black/50 z-10 transition-opacity",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div
        className={clsx(
          "md:hidden fixed top-0 left-0 h-full w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 z-20 transform transition-transform",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pt-20"> {/* Offset for header */}
          <SidebarContent />
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {activeView === 'dashboard' && <Dashboard data={processedData} />}
        {activeView === 'playerView' && <PlayerView data={processedData} playerNames={playerNames} />}
        {activeView === 'addResult' && <AddResult playerNames={playerNames} />}
      </main>
    </div>
  );
};

export default App;