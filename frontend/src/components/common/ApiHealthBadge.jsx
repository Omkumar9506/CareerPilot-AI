import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '../../services/healthService';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export const ApiHealthBadge = ({ className = '' }) => {
  const [status, setStatus] = useState({
    checked: false,
    isOnline: false,
    message: '',
  });

  useEffect(() => {
    let isMounted = true;
    
    const verifyHealth = async () => {
      const res = await checkApiHealth();
      if (isMounted) {
        setStatus({
          checked: true,
          isOnline: res.isOnline,
          message: res.message,
        });
      }
    };

    verifyHealth();

    // Check periodically every 45 seconds without spamming
    const interval = setInterval(verifyHealth, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!status.checked) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-400 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
        <span>Checking Gateway...</span>
      </div>
    );
  }

  return (
    <div
      title={status.message}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        status.isOnline
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm'
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {status.isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span>
        {status.isOnline ? 'API Gateway: Connected' : 'API Gateway: Offline'}
      </span>
    </div>
  );
};

export default ApiHealthBadge;
