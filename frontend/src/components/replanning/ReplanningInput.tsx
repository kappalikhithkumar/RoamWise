import React, { useState } from 'react';

interface ReplanningInputProps {
  value: string;
  onChange: (val: string) => void;
  onVoiceToggle?: () => void;
}

export const ReplanningInput: React.FC<ReplanningInputProps> = ({
  value,
  onChange,
  onVoiceToggle
}) => {
  const [isListening, setIsListening] = useState(false);

  const handleMicClick = () => {
    setIsListening(true);
    if (onVoiceToggle) onVoiceToggle();
    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <label htmlFor="reroute-details" className="font-heading text-sm font-semibold text-on-surface">
          Details & Special Requests
        </label>
        <span className="font-label text-xs text-on-surface-variant">Natural language AI input</span>
      </div>

      <div className="relative bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm focus-within:border-primary transition-all">
        <textarea
          id="reroute-details"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="E.g. Our cab is delayed by 45 minutes near Hawa Mahal. Please adjust our afternoon visits."
          className="w-full bg-transparent px-space-md pt-space-md pb-12 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none resize-none"
        />

        {/* Bottom Bar inside Textarea Container */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label text-[11px] text-primary font-medium">
              Context auto-detected • Day 01
            </span>
          </div>

          <button
            type="button"
            onClick={handleMicClick}
            aria-label="Voice input"
            className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isListening
                ? 'bg-error text-on-error animate-pulse'
                : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isListening ? 'mic' : 'mic_none'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
