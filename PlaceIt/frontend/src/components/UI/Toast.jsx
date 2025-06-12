import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ type = "success", message, isVisible, onClose }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  };

  const Icon = icons[type];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div className={`${colors[type]} text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-white/20`}>
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="flex-1">{message}</p>
          <button
            onClick={onClose}
            className="ml-3 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
