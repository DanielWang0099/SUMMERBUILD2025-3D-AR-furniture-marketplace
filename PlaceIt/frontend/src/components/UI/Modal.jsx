import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = "medium" }) => {
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-7xl"
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full ${sizeClasses[size]} bg-white/90 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl shadow-2xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#29d4c5]/20">
            <h3 className="text-xl font-bold text-[#0c1825]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#29d4c5]/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-[#0c1825]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Modal;
