import React, { useState } from 'react';

const rules = `{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}`;

const FirebasePermissionErrorModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rules).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-3xl w-full bg-red-900/20 backdrop-blur-lg border border-red-400/50 shadow-2xl rounded-xl p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-400 text-center">Database Permission Error</h1>
        <p className="text-slate-200 text-center">
          The application could not connect to the database due to a <strong className="font-semibold text-white">"Permission Denied"</strong> error. This is usually because the default Firebase Realtime Database security rules are too restrictive.
        </p>
        
        <div className="space-y-4 text-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-white">How to fix it:</h2>
            <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Firebase Console</a>.</li>
                <li>Select your project (<code className="bg-black/30 p-1 rounded text-sm">multi-e4d82</code>).</li>
                <li>From the left-hand menu, go to <strong className="text-white">Build &gt; Realtime Database</strong>.</li>
                <li>Click on the <strong className="text-white">Rules</strong> tab.</li>
                <li>Replace the existing rules with the following JSON code:</li>
            </ol>
        </div>

        <div className="relative bg-black/40 rounded-lg p-4 font-mono text-sm">
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold py-1 px-2 rounded transition-colors"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="text-green-300 whitespace-pre-wrap">{rules}</pre>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-400/50 text-yellow-200 p-4 rounded-lg text-sm">
            <p><strong className="font-semibold">Security Warning:</strong> These rules make your database public to anyone. This is acceptable for development, but you should use more secure rules for a production app.</p>
        </div>

        <p className="text-slate-300 text-center pt-4">
            After updating the rules, please <strong className="text-white">refresh this page</strong>.
        </p>
      </div>
    </div>
  );
};

export default FirebasePermissionErrorModal;