import React, { useEffect } from "react";
import Icon from "./icons/Icon";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  maxWidth = "md",
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} z-50 overflow-hidden transform transition-all`}
          style={{
            backgroundColor: "var(--color-card-bg)",
            color: "var(--color-text)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex justify-between items-center"
            style={{
              borderBottom: "1px solid var(--color-card-border)",
            }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="focus:outline-none hover:opacity-80"
              style={{ color: "var(--color-text-light)" }}
              aria-label="Close"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
