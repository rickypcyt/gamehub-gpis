"use client";

import { AlertCircle, Check } from "lucide-react";
import { type InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
  hint?: string;
  isValid?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, touched, hint, isValid, className = "", id, ...props }, ref) => {
    const hasError = touched && !!error;
    const showValid = touched && isValid && !error;

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={`
              w-full rounded-lg border bg-zinc-800 px-4 py-2.5 text-white 
              placeholder:text-zinc-500 
              focus:outline-none focus:ring-2 
              transition-colors
              ${hasError 
                ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20" 
                : showValid 
                  ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                  : "border-zinc-700 focus:border-violet-500 focus:ring-violet-500/20"
              }
              ${className}
            `}
            {...props}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          {showValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>
        {hasError && (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {hint && !hasError && (
          <p className="text-xs text-zinc-500">{hint}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
