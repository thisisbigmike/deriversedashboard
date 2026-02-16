'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  // HTMLMotionProps already has className, disabled, onClick, type, etc.
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
  type = 'button',
  ...props
}: ButtonProps) {
  const variants = {
    primary: `
      liquid-glass-cyan
      text-primary-foreground font-semibold
      hover:text-primary-foreground
    `,
    secondary: `
      liquid-glass
      text-muted-foreground
      hover:text-foreground
    `,
    ghost: `
      bg-transparent
      text-muted-foreground
      hover:text-foreground hover:liquid-glass
      backdrop-blur-sm
    `,
    danger: `
      liquid-glass-danger
      text-destructive-foreground
      hover:text-destructive-foreground
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}
