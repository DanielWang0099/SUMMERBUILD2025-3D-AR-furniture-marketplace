import React from 'react';

class ThreeDViewerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ThreeDViewer Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
          <div className="text-center p-6">
            <div className="text-gray-600 mb-2">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              3D Viewer Error
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Failed to load the 3D viewer. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onClose) {
                  this.props.onClose();
                }
              }}
              className="px-4 py-2 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
            >
              Close 3D View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThreeDViewerErrorBoundary;
