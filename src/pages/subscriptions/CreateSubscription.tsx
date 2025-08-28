import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/Modal"; 
import { FaPlus, FaMinus, FaSave, FaTimes, FaInfo } from "react-icons/fa";
import { addSubscription } from "../../api/services/subscriptionService";

const CreateSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration: "monthly",
    ideal: "",
    storage: "",
    features: [""],
    mostPopular: false,
    isActive: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | 
    React.ChangeEvent<HTMLSelectElement> | 
    React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prevData => ({
      ...prevData,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prevData => ({
      ...prevData,
      features: [...prevData.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prevData => ({
        ...prevData,
        features: newFeatures
      }));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic validation
  if (!formData.name.trim() || !formData.ideal.trim()) {
    toast.error("Plan name and description are required");
    return;
  }

  if (formData.features.some(feature => !feature.trim())) {
    toast.error("All features must have content");
    return;
  }

  try {
    setLoading(true);

    // Remove the mock delay - this is not needed
    // await new Promise(resolve => setTimeout(resolve, 1500));

    const subscriptionData = {
      name: formData.name.trim(),
      price: formData.price,
      duration: formData.duration as 'monthly' | 'HalfYear' | 'yearly',
      ideal: formData.ideal.trim(),
      storage: formData.storage.trim() || undefined,
      features: formData.features.filter(f => f.trim()),
      mostPopular: formData.mostPopular,
      isActive: formData.isActive
      // Remove id, createdAt, updatedAt - Firebase service handles these
    };

    console.log("Creating subscription with data:", subscriptionData);

    const result = await addSubscription(subscriptionData);

    // Handle the response properly
    if (result.success) {
      console.log("Subscription created successfully with ID:", result.id);
      setIsModalOpen(true);
      setFormData({
        name: "",
        price: 0,
        duration: "monthly",
        ideal: "",
        storage: "",
        features: [""],
        mostPopular: false,
        isActive: true
      });
      toast.success("Subscription plan created successfully!");
      setTimeout(() => navigate("/admin/subscriptions-list"), 2000); // Fix navigation path
    } else {
      console.error("Failed to create subscription:", result.message);
      toast.error(result.message || "Failed to create subscription plan");
    }
  } catch (error) {
    console.error("Error in handleSubmit:", error);
    toast.error("Failed to create subscription. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate("/admin/subjects-list");
  };

  const handleCancel = () => {
    navigate("/admin/subjects-list");
  };

  const formatPrice = (price: number, duration: string) => {
    if (price === 0) return "Free";
    const currency = "₹";
    const durationLabel = duration === "monthly" ? "/month" : 
                         duration === "HalfYear" ? "/6 months" : "/year";
    return `${currency}${price.toLocaleString()}${durationLabel}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Subscription Plan</h2>
          <div className="text-sm text-gray-600">
            Add a new pricing plan for your service
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-gray-800 font-semibold">
                Plan Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
                placeholder="e.g., Basic, Pro, Enterprise"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block mb-2 text-gray-800 font-semibold">
                Duration *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="HalfYear">6 Months</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block mb-2 text-gray-800 font-semibold">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Preview: {formatPrice(formData.price, formData.duration)}
              </div>
            </div>

            <div>
              <label htmlFor="storage" className="block mb-2 text-gray-800 font-semibold">
                Storage Limit
              </label>
              <input
                type="text"
                id="storage"
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
                placeholder="e.g., 100GB, 1TB, Unlimited"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="ideal" className="block mb-2 text-gray-800 font-semibold">
              Plan Description *
            </label>
            <textarea
              id="ideal"
              name="ideal"
              value={formData.ideal}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
              placeholder="Describe who this plan is ideal for and what it offers..."
              rows={4}
              required
            />
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-gray-800 font-semibold">Plan Features *</label>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFD426] text-black rounded-lg hover:bg-[#e6b800] transition"
              >
                <FaPlus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/20"
                      placeholder="e.g., Storage - 100 GB"
                      required
                    />
                  </div>
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remove feature"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <FaInfo className="w-4 h-4" />
              Common features: Storage, Events, Hosting Duration, Support, etc.
            </div>
          </div>

          {/* Plan Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mostPopular"
                name="mostPopular"
                checked={formData.mostPopular}
                onChange={handleChange}
                className="w-5 h-5 text-[#FFD426] border-2 border-gray-300 rounded focus:ring-[#FFD426] focus:ring-2"
              />
              <label htmlFor="mostPopular" className="ml-3 text-gray-700 font-medium">
                Mark as "Most Popular"
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-[#FFD426] border-2 border-gray-300 rounded focus:ring-[#FFD426] focus:ring-2"
              />
              <label htmlFor="isActive" className="ml-3 text-gray-700 font-medium">
                Active Plan
              </label>
            </div>
          </div>

          {/* Preview Card */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>
            <div className="bg-white p-4 rounded-lg border shadow-sm max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-900">{formData.name || "Plan Name"}</h4>
                {formData.mostPopular && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[#FFD426] mb-2">
                {formatPrice(formData.price, formData.duration)}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {formData.ideal || "Plan description will appear here..."}
              </div>
              <div className="space-y-1">
                {formData.features.filter(f => f.trim()).map((feature, index) => (
                  <div key={index} className="text-sm text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
                {formData.features.filter(f => f.trim()).length === 0 && (
                  <div className="text-sm text-gray-400">No features added yet...</div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-[#FFD426] text-black rounded-lg text-lg font-semibold hover:bg-[#e6b800] disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              <FaSave />
              {loading ? "Creating..." : "Create Plan"}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition"
              onClick={handleCancel}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </form>

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title="Success"
          message="Subscription plan created successfully!"
        />
      </div>
    </div>
  );
};

export default CreateSubscription;