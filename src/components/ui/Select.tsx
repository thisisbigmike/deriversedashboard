'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function Select({ options, value, onChange, placeholder = 'Select...', className = '' }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          w-full px-3 py-2 rounded-lg
          bg-popover border border-border
          text-sm text-foreground
          flex items-center justify-between gap-2
          hover:bg-popover/80 hover:border-border/80
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/50
        "
            >
                <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="
              absolute top-full left-0 right-0 mt-1 z-50
              bg-popover border border-border
              rounded-lg
              shadow-xl shadow-black/10 dark:shadow-black/50
              max-h-60 overflow-auto
            "
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                  w-full px-3 py-2 text-left text-sm
                  transition-colors duration-150
                  ${option.value === value
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }
                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
