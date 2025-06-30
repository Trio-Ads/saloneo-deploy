import React from 'react';
import { SwatchIcon, EyeDropperIcon } from '@heroicons/react/24/outline';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="glass-card p-6 hover:bg-white/5 transition-all duration-300 border border-white/20">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 min-w-[140px]">
          <SwatchIcon className="h-5 w-5 text-purple-400" />
          <label className="text-sm font-medium text-gray-800">{label}</label>
        </div>
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative group">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-12 w-12 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
            />
            <div 
              className="h-12 w-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl border-2 border-white/20"
              style={{ 
                backgroundColor: value,
                boxShadow: `0 0 15px ${value}40, 0 0 30px ${value}20`
              }}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex items-center space-x-3">
            <EyeDropperIcon className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={value.toUpperCase()}
              onChange={(e) => onChange(e.target.value)}
              className="glass-input px-4 py-2 text-sm text-gray-800 placeholder-gray-400 w-32
                       transition-all duration-300 hover:bg-white/5 border border-white/20"
              placeholder="#000000"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full transition-all duration-300 border-2 border-white/30 shadow-lg"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs text-gray-600 font-mono">{value.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
