import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, CubeIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner'; // Adjust path as needed

const UploadItemForm = React.memo(({
  formData,
  setFormData,
  uploadFiles,
  handleInputChange,
  handleArrayInputChange,
  handleFileUpload,
  submitListing,
  loading,
  categories
}) => {
  // Handle publish listing - sets status to active before submitting
  const handlePublishListing = useCallback((e) => {
    e.preventDefault();
    submitListing(e, 'active');
  }, [submitListing]);

  // Handle save as draft - sets status to draft before submitting
  const handleSaveAsDraft = useCallback((e) => {
    e.preventDefault();
    submitListing(e, 'draft');
  }, [submitListing]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-[#0c1825] mb-6">Add New Furniture Item</h3>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Modern Sectional Sofa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Price *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Description *
          </label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            placeholder="Describe your furniture item..."
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Short Description
          </label>
          <textarea
            rows="2"
            value={formData.short_description}
            onChange={(e) => handleInputChange('short_description', e.target.value)}
            className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            placeholder="Brief description for listing preview..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Height
            </label>
            <input
              type="number"
              value={formData.dimensions.height}
              onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Width
            </label>
            <input
              type="number"
              value={formData.dimensions.width}
              onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="84"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Depth
            </label>
            <input
              type="number"
              value={formData.dimensions.depth}
              onChange={(e) => handleInputChange('dimensions.depth', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="36"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Unit
            </label>
            <select
              value={formData.dimensions.unit}
              onChange={(e) => handleInputChange('dimensions.unit', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            >
              <option value="inches">Inches</option>
              <option value="cm">Centimeters</option>
              <option value="feet">Feet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Materials (comma separated)
            </label>
            <input
              type="text"
              value={formData.materials.join(', ')}
              onChange={(e) => handleArrayInputChange('materials', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Leather, Wood, Metal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Colors (comma separated)
            </label>
            <input
              type="text"
              value={formData.colors.join(', ')}
              onChange={(e) => handleArrayInputChange('colors', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Brown, Black, Gray"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Features (comma separated)
          </label>
          <input
            type="text"
            value={formData.features.join(', ')}
            onChange={(e) => handleArrayInputChange('features', e.target.value)}
            className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            placeholder="e.g., Convertible, Storage, Reclining"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Inventory Count
            </label>
            <input
              type="number"
              value={formData.inventory_count}
              onChange={(e) => handleInputChange('inventory_count', parseInt(e.target.value) || 1)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Upload Images *
          </label>
          <div className="border-2 border-dashed border-[#29d4c5]/30 rounded-lg p-8 text-center bg-white/40">
            <CloudArrowUpIcon className="h-12 w-12 text-[#29d4c5] mx-auto mb-4" />
            <p className="text-[#2a5d93] mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-[#2a5d93]/60">PNG, JPG up to 10MB each</p>
            <div className="mt-4 flex justify-center">
              <label className="cursor-pointer bg-[#29d4c5] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#22bfb3] transition">
                Upload Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
            {uploadFiles.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[#0c1825]">{uploadFiles.images.length} image(s) selected</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Upload Video for 3D Model Generation (Optional)
          </label>
          <div className="border-2 border-dashed border-[#209aaa]/30 rounded-lg p-8 text-center bg-white/40">
            <CubeIcon className="h-12 w-12 text-[#209aaa] mx-auto mb-4" />            <p className="text-[#2a5d93] mb-2">Upload a 360° video of your furniture</p>
            <p className="text-sm text-[#2a5d93]/60">
              MP4, MOV up to 100MB. Rotate around your furniture slowly for best results.
            </p>
            <div className="mt-4 flex justify-center">
              <label className="cursor-pointer bg-[#2a5d93] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#244d7d] transition">
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload('video', e.target.files)}
                  className="hidden"
                />
              </label>
            </div>            {uploadFiles.video && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-[#0c1825] font-medium">
                  ✓ Video selected: {uploadFiles.video.name}
                </p>
                <p className="text-xs text-[#2a5d93]/70">
                  File size: {(uploadFiles.video.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>        {/* 3D Model Generation Checkbox */}
        {uploadFiles.video && (
          <div className="bg-gradient-to-r from-[#29d4c5]/10 to-[#209aaa]/10 border border-[#29d4c5]/30 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="generate3D"
                  type="checkbox"
                  checked={formData.generate3D}
                  onChange={(e) => handleInputChange('generate3D', e.target.checked)}
                  className="h-4 w-4 text-[#29d4c5] focus:ring-[#29d4c5] border-[#29d4c5]/30 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="generate3D" className="font-medium text-[#0c1825] cursor-pointer">
                  Generate 3D Model from Video
                </label>
                <p className="text-[#2a5d93]/80 mt-1">
                  Use AI-powered photogrammetry to create a 3D model from your uploaded video. This will allow customers to view your furniture in AR and get a better understanding of the product.
                </p>
                {formData.generate3D && (
                  <div className="mt-2 p-3 bg-[#29d4c5]/10 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-[#29d4c5]" />
                      <span className="text-xs text-[#2a5d93] font-medium">
                        3D model generation will start after your listing is created. Monitor progress in the dashboard.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}        <div className="flex space-x-4">          <button
            type="button"
            onClick={handlePublishListing}
            disabled={loading}
            className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : <PlusIcon className="h-5 w-5" />}
            <span>{loading ? 'Publishing...' : 'Publish Listing'}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={loading}
            className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-8 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </motion.div>
  );
});

export default UploadItemForm;