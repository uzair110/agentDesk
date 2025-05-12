import React, { ReactNode, MouseEvent } from "react";

export type ModalAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ModalAction[];
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions = [],
}: ModalProps) {
  if (!isOpen) return null;

  // Prevent clicks inside the dialog from bubbling to the backdrop
  function handleDialogClick(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-black/30 backdrop-filter"
      onClick={onClose} 
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={handleDialogClick}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        <div className="px-6 py-4">
          {children}
        </div>

        {actions.length > 0 && (
          <div className="flex justify-end space-x-2 px-6 py-4">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={
                  action.variant === "secondary"
                    ? "px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    : "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}