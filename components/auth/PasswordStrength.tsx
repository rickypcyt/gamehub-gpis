"use client";

import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "bg-zinc-700" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Débil", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Media", color: "bg-amber-500" };
  return { score, label: "Fuerte", color: "bg-emerald-500" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = calculateStrength(password);
  const maxScore = 5;

  if (!password) return null;

  const icons = {
    Débil: <ShieldAlert className="h-4 w-4 text-red-400" />,
    Media: <Shield className="h-4 w-4 text-amber-400" />,
    Fuerte: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">Fortaleza</span>
        <span className={`flex items-center gap-1 text-xs font-semibold ${
          label === "Débil" ? "text-red-400" : label === "Media" ? "text-amber-400" : "text-emerald-400"
        }`}>
          {icons[label as keyof typeof icons]}
          {label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxScore }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? color : "bg-zinc-700"
            }`}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {[
          { met: password.length >= 8, text: "8+ caracteres" },
          { met: /[A-Z]/.test(password), text: "Mayúscula" },
          { met: /[0-9]/.test(password), text: "Número" },
          { met: /[^A-Za-z0-9]/.test(password), text: "Símbolo" },
        ].map((req) => (
          <li
            key={req.text}
            className={`text-[11px] transition-colors ${
              req.met ? "text-emerald-400" : "text-zinc-600"
            }`}
          >
            {req.met ? "✓" : "○"} {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
