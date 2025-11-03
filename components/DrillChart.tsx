import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartData } from '../types';
import clsx from 'clsx';

interface DrillChartProps {
  drillName: string;
  data: ChartData[];
  onDoubleClick?: (drillName: string) => void;
  isFullscreen?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, isFullscreen }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={clsx(
          "p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-xl",
          isFullscreen ? "text-base" : "text-sm"
        )}>
          <p className="font-bold text-white">{label}</p>
          <p className="text-blue-400">{`Score: ${data.score}`}</p>
          <p className="text-red-400">{`Team Average: ${data.average}`}</p>
        </div>
      );
    }
  
    return null;
  };

const CustomLegend: React.FC<{isFullscreen?: boolean}> = ({ isFullscreen }) => (
    <div className={clsx("flex items-center justify-center space-x-6 flex-shrink-0", isFullscreen ? "pt-6 text-sm" : "pt-4 text-xs")}>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-gray-300">Player Score</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500" />
            <span className="text-gray-300">Team Average</span>
        </div>
    </div>
);


const DrillChart: React.FC<DrillChartProps> = ({ drillName, data, onDoubleClick, isFullscreen = false }) => {
  
  const containerClasses = clsx(
    "bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col",
    {
      "h-72 sm:h-80": !isFullscreen,
      "h-full w-full": isFullscreen,
    }
  );

  const teamAverage = data.length > 0 ? data[0].average : 0;

  return (
    <div className={containerClasses} onDoubleClick={onDoubleClick ? () => onDoubleClick(drillName) : undefined}>
      <h3 className={clsx(
        "font-bold text-white mb-4 truncate flex-shrink-0",
        isFullscreen ? "text-3xl" : "text-xl"
      )}>
        {drillName}
      </h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
                layout="vertical"
                data={data} 
                margin={isFullscreen ? 
                    { top: 10, right: 40, bottom: 10, left: 20 } : 
                    { top: 5, right: 20, bottom: 5, left: 10 }
                }
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" horizontal={false} />
                <XAxis 
                    type="number"
                    domain={[0, 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                        fill: '#a0aec0', 
                        fontSize: isFullscreen ? 14 : 12, 
                        fontFamily: 'sans-serif' 
                    }}
                    ticks={drillName === 'Jonglieren' ? [0, 25, 50, 75, 100] : undefined}
                />
                <YAxis 
                    dataKey="player" 
                    type="category"
                    width={isFullscreen ? 80 : 60}
                    axisLine={false}
                    tickLine={false}
                    tick={{ 
                        fill: '#e2e8f0', 
                        fontSize: isFullscreen ? 16 : 12, 
                        fontFamily: 'sans-serif',
                        textAnchor: 'end',
                        dx: -8
                    }}
                    interval={0}
                />
                <Tooltip 
                  content={<CustomTooltip isFullscreen={isFullscreen} />} 
                  cursor={{fill: 'rgba(74, 85, 104, 0.4)'}} 
                />
                <Bar dataKey="score" name="Player Score" fill="#3b82f6" barSize={isFullscreen ? 25 : 20} />
                <ReferenceLine x={teamAverage} stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend isFullscreen={isFullscreen} />
    </div>
  );
};

export default DrillChart;