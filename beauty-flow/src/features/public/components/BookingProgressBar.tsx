import React from 'react';
import { 
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { BookingStep } from '../types';
import { useTemplateStyles } from '../../../hooks/useTemplateStyles';

interface BookingProgressBarProps {
  currentStep: BookingStep;
}

const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
  const { colors } = useTemplateStyles();

  const steps = [
    { 
      id: 'datetime', 
      label: 'Date et heure',
      icon: CalendarDaysIcon,
      description: 'Choisissez votre créneau'
    },
    { 
      id: 'client', 
      label: 'Informations',
      icon: UserIcon,
      description: 'Vos coordonnées'
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="py-8 animate-fadeIn">
      <div 
        className="glass-card p-8 rounded-2xl border border-white/20"
        style={{
          background: `linear-gradient(to right, ${colors.primary}08, ${colors.accent}08)`
        }}
      >
        <div className="relative flex items-center justify-center max-w-2xl mx-auto">
          {/* Background line */}
          <div className="absolute inset-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full" />
          
          {/* Progress line */}
          <div 
            className="absolute left-0 h-1 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`
            }}
          />
          
          {/* Steps */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = currentStepIndex > index;
              const isCurrent = currentStepIndex === index;
              const isUpcoming = currentStepIndex < index;
              
              return (
                <div key={step.id} className="flex flex-col items-center group">
                  {/* Step circle */}
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      transition-all duration-500 transform relative overflow-hidden
                      ${isCompleted 
                        ? 'shadow-lg scale-110' 
                        : isCurrent
                          ? 'shadow-xl scale-125 animate-pulse' 
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500'}
                      border-4 border-white shadow-lg
                    `}
                    style={
                      isCompleted 
                        ? { background: `linear-gradient(to right, ${colors.success}, ${colors.success})` }
                        : isCurrent
                          ? { background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})` }
                          : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-8 w-8 text-white" />
                    ) : isCurrent ? (
                      <IconComponent className="h-8 w-8 text-white animate-pulse" />
                    ) : (
                      <IconComponent className="h-6 w-6 text-white" />
                    )}
                    
                    {/* Shine effect for current step */}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                     transform -skew-x-12 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Step content */}
                  <div className="mt-4 text-center max-w-32">
                    <div 
                      className={`
                        text-lg font-bold transition-all duration-500 mb-1
                        ${isCompleted 
                          ? '' 
                          : isCurrent
                            ? '' 
                            : 'text-gray-500'}
                      `}
                      style={
                        isCompleted 
                          ? { color: colors.success }
                          : isCurrent
                            ? { 
                                background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }
                            : undefined
                      }
                    >
                      {step.label}
                    </div>
                    
                    <div 
                      className={`
                        text-sm transition-all duration-500
                        ${isCompleted 
                          ? '' 
                          : isCurrent
                            ? 'font-medium' 
                            : 'text-gray-400'}
                      `}
                      style={
                        isCompleted 
                          ? { color: colors.success }
                          : isCurrent
                            ? { color: colors.primary }
                            : undefined
                      }
                    >
                      {step.description}
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-2 flex justify-center">
                      {isCompleted && (
                        <div className="flex items-center space-x-1" style={{ color: colors.success }}>
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">Terminé</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="flex items-center space-x-1" style={{ color: colors.primary }}>
                          <ClockIcon className="h-4 w-4 animate-pulse" />
                          <span className="text-xs font-medium">En cours</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Progress percentage */}
        <div className="mt-8 text-center">
          <div className="glass-card bg-white/70 p-4 rounded-xl inline-block">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`
                }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                Progression: {Math.round((currentStepIndex / (steps.length - 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgressBar;
