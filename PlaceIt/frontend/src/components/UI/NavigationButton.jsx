import { useSmoothNavigation } from '../../hooks/useSmoothNavigation';

const NavigationButton = ({ 
  to, 
  children, 
  className = '', 
  requireAuth = true, 
  variant = 'primary',
  ...props 
}) => {
  const { smoothNavigate } = useSmoothNavigation();

  const baseClasses = "inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white focus:ring-[#29d4c5]",
    secondary: "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 focus:ring-white/50",
    outline: "border-2 border-[#29d4c5] text-[#29d4c5] hover:bg-[#29d4c5] hover:text-white focus:ring-[#29d4c5]"
  };

  const variantClasses = variants[variant] || variants.primary;

  const handleClick = (e) => {
    e.preventDefault();
    smoothNavigate(to, { requireAuth });
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default NavigationButton;
