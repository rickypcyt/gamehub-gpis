"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  action: string;
  confirmMessage: string;
}

export function DeleteButton({ action, confirmMessage }: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} method="POST" className="inline">
      <button
        type="submit"
        className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
        title="Eliminar"
        onClick={handleClick}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
