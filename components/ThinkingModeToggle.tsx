
import React from 'react';

interface ThinkingModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ThinkingModeToggle: React.FC<ThinkingModeToggleProps> = ({ enabled, onChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="thinking-mode-toggle" className="text-sm font-medium text-gray-300">
        Thinking Mode
      </label>
      <button
        type="button"
        id="thinking-mode-toggle"
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ThinkingModeToggle;
