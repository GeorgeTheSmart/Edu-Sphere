"use client";

import { ReactNode, useEffect } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ""
}: ModalProps) {
  // Escape key handler & body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Render modal using React Portal directly into document.body
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out"
        onClick={handleOverlayClick}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`
            relative w-full ${sizeClasses[size]} transform overflow-hidden
            rounded-2xl bg-white shadow-2xl ring-1 ring-black/5
            transition-all duration-300 ease-out
            animate-in zoom-in-95 fade-in-0
            ${className}
          `}
          style={{ zIndex: 10000 }} // higher than backdrop
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 leading-6"
                >
                  {title}
                </h2>
              )}

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    ml-auto flex h-8 w-8 items-center justify-center rounded-full 
                    text-gray-400 transition-all duration-200 
                    hover:bg-gray-100 hover:text-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    active:scale-95
                  "
                  aria-label="Close modal"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`px-6 ${title || showCloseButton ? "pb-6" : "py-6"}`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
