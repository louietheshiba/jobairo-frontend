import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import useOutsideAlerter from '@/hooks/outSideAlerter';

type ModalProps = {
  isOpen: boolean;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  onClose: () => void;
  isCloseIcon?: boolean;
};

const Modal = ({
  children,
  maxWidth = 'max-w-lg',
  className,
  isOpen,
  onClose,
  isCloseIcon = true,
}: ModalProps) => {
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, () => {
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm">
      <div
        ref={wrapperRef}
        className={`w-full ${maxWidth} zoomIn rounded-md bg-white shadow-lg ${className}`}
      >
        {isCloseIcon && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-xl text-gray-500 hover:text-gray-700 dark:text-white"
          >
            <X />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
