import React from "react";
import { Sun, Droplet, CloudRain } from "lucide-react";

interface MetricMeterProps {
  type: "sunlight" | "watering" | "humidity";
  value: number; // 1-5 rating
  label: string;
}

export default function MetricMeter({ type, value, label }: MetricMeterProps) {
  // Ensure value is bounded between 1 and 5
  const clampedValue = Math.min(5, Math.max(1, value));

  const getMeterStyles = () => {
    switch (type) {
      case "sunlight":
        return {
          icon: <Sun id="sun-meter-icon" className="w-5 h-5 text-amber-500" />,
          unfilledColor: "bg-amber-100",
          filledColor: "bg-amber-500",
          textColor: "text-amber-800 bg-amber-50",
          label: "Sunlight Requirement"
        };
      case "watering":
        return {
          icon: <Droplet id="water-meter-icon" className="w-5 h-5 text-emerald-500" />,
          unfilledColor: "bg-emerald-100",
          filledColor: "bg-emerald-500",
          textColor: "text-emerald-800 bg-emerald-50",
          label: "Moisture Demand"
        };
      case "humidity":
        return {
          icon: <CloudRain id="humidity-meter-icon" className="w-5 h-5 text-sky-500" />,
          unfilledColor: "bg-sky-100",
          filledColor: "bg-sky-500",
          textColor: "text-sky-800 bg-sky-50",
          label: "Atmospheric Humidity"
        };
    }
  };

  const styles = getMeterStyles();

  return (
    <div id={`${type}-meter-wrapper`} className="p-4 border border-zinc-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div id={`${type}-meter-header`} className="flex items-center justify-between mb-2">
        <div id={`${type}-meter-title-container`} className="flex items-center gap-2">
          {styles.icon}
          <span id={`${type}-meter-title`} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">
            {styles.label}
          </span>
        </div>
        <span id={`${type}-meter-badge`} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${styles.textColor}`}>
          Lvl {clampedValue}/5
        </span>
      </div>

      <div id={`${type}-meter-bar-container`} className="flex gap-1.5 h-2.5 w-full mt-3">
        {[1, 2, 3, 4, 5].map((step) => {
          const isFilled = step <= clampedValue;
          return (
            <div
              id={`${type}-meter-segment-${step}`}
              key={step}
              className={`flex-1 rounded-full w-full transition-all duration-500 ${
                isFilled ? styles.filledColor : "bg-zinc-100"
              }`}
            />
          );
        })}
      </div>

      <p id={`${type}-meter-caption`} className="mt-3 text-xs text-zinc-600 leading-relaxed font-sans font-normal">
        {label}
      </p>
    </div>
  );
}
