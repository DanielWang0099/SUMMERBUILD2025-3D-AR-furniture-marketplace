import { motion } from 'framer-motion';
import { InboxIcon } from '@heroicons/react/24/outline';

const NoData = ({ message = "No data found", icon: Icon = InboxIcon, className = "", actionComponent = null }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-lg text-center ${className}`}
    >
      <Icon className="h-16 w-16 text-[#b6cacb] mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">{message}</h2>
      {actionComponent && (
        <div className="mt-4">
          {actionComponent}
        </div>
      )}
    </motion.div>
  );
};

export default NoData;
