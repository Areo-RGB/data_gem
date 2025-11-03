import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartData as ChartJsData,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { ChartData } from '../types';
import clsx from 'clsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface DrillChartProps {
  drillName: string;
  data: ChartData[];
  onDoubleClick?: (drillName: string) => void;
  isFullscreen?: boolean;
}

const CustomLegend: React.FC<{isFullscreen?: boolean}> = ({ isFullscreen }) => (
    <div className={clsx("flex items-center justify-center space-x-6 flex-shrink-0", isFullscreen ? "pt-6 text-sm" : "pt-4 text-xs")}>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-slate-300">Player Score</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-red-500" />
            <span className="text-slate-300">Team Average</span>
        </div>
    </div>
);


const DrillChart: React.FC<DrillChartProps> = ({ drillName, data, onDoubleClick, isFullscreen = false }) => {
  
  const containerClasses = clsx(
    "bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl rounded-xl p-4 sm:p-6 flex flex-col",
    {
      "h-full w-full": isFullscreen,
    }
  );

  const teamAverage = data.length > 0 ? data[0].average : 0;

  // Calculate dynamic height based on number of players to prevent cramming
  const BAR_HEIGHT_PER_PLAYER = 32;
  const X_AXIS_AND_PADDING_HEIGHT = 60;
  const MIN_CHART_HEIGHT = 220;

  const dynamicHeight = Math.max(
    MIN_CHART_HEIGHT,
    (data.length * BAR_HEIGHT_PER_PLAYER) + X_AXIS_AND_PADDING_HEIGHT
  );
  
  const chartContainerStyle: React.CSSProperties = isFullscreen 
    ? { flexGrow: 1, position: 'relative' } 
    : { height: `${dynamicHeight}px`, position: 'relative' };

  const chartJsData: ChartJsData<'bar'> = {
    labels: data.map(d => d.player),
    datasets: [
      {
        label: 'Player Score',
        data: data.map(d => d.score),
        backgroundColor: '#3b82f6',
        barThickness: isFullscreen ? 25 : 20,
      }
    ],
  };

  const averageLinePlugin: Plugin<'bar'> = {
    id: 'averageLine',
    afterDatasetsDraw(chart) {
      const { ctx, scales: { x } } = chart;
      const xValue = x.getPixelForValue(teamAverage);
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xValue, chart.chartArea.top);
      ctx.lineTo(xValue, chart.chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();
      ctx.restore();
    }
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#cbd5e1', // slate-300
          font: {
            size: isFullscreen ? 14 : 12,
            family: 'sans-serif',
          },
          ...(drillName === 'Jonglieren' && {
            stepSize: 25,
            max: 100
          }),
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1', // slate-300
          font: {
            size: isFullscreen ? 16 : 12,
            family: 'sans-serif',
          },
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Using custom legend
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => `Score: ${context.raw}`,
          afterBody: () => [`Team Average: ${teamAverage}`],
        },
      },
    },
  };

  return (
    <div className={containerClasses} onDoubleClick={onDoubleClick ? () => onDoubleClick(drillName) : undefined}>
      <h3 className={clsx(
        "font-bold text-white mb-4 truncate flex-shrink-0",
        isFullscreen ? "text-3xl" : "text-xl"
      )}>
        {drillName}
      </h3>
      <div style={chartContainerStyle}>
        <Bar options={options} data={chartJsData} plugins={[averageLinePlugin]} />
      </div>
      <CustomLegend isFullscreen={isFullscreen} />
    </div>
  );
};

export default DrillChart;