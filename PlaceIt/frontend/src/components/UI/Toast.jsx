import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ type = "success", message, isVisible, onClose }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  const styles = {
    success: {
      gradient: "from-[#29d4c5] via-[#209aaa] to-[#2a5d93]",
      iconColor: "text-[#29d4c5]",
      borderColor: "border-[#29d4c5]/30"
    },
    error: {
      gradient: "from-red-400 via-red-500 to-red-600",
      iconColor: "text-red-400",
      borderColor: "border-red-400/30"
    },
    warning: {
      gradient: "from-yellow-400 via-yellow-500 to-orange-500",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-400/30"
    },
    info: {
      gradient: "from-[#209aaa] via-[#2a5d93] to-[#0c1825]",
      iconColor: "text-[#209aaa]",
      borderColor: "border-[#209aaa]/30"
    }
  };

  const Icon = icons[type];
  const style = styles[type];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div className={`
        bg-white/10 backdrop-blur-md border ${style.borderColor} 
        rounded-2xl shadow-2xl overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-r before:${style.gradient} before:opacity-20 before:rounded-2xl
        relative
      `}>
        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl bg-white/20 backdrop-blur-sm ${style.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium leading-relaxed pr-2">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Gradient border effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${style.gradient} opacity-30 blur-[1px] -z-10`}></div>
      </div>
    </motion.div>
  );
};

export default Toast;
