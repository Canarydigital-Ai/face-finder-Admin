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
    isActive: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
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
    setFormData((prevData) => ({
      ...prevData,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prevData) => ({
      ...prevData,
      features: [...prevData.features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prevData) => ({
        ...prevData,
        features: newFeatures,
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

    if (formData.features.some((feature) => !feature.trim())) {
      toast.error("All features must have content");
      return;
    }

    try {
      setLoading(true);

      const subscriptionData = {
        name: formData.name.trim(),
        price: formData.price,
        duration: formData.duration as "monthly" | "half-year" | "yearly",
        ideal: formData.ideal.trim(),
        storage: formData.storage.trim() || undefined,
        features: formData.features.filter((f) => f.trim()),
        mostPopular: formData.mostPopular,
        isActive: formData.isActive,
      };

      console.log("Creating subscription with data:", subscriptionData);

      const result = await addSubscription(subscriptionData);

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
          isActive: true,
        });
        toast.success("Subscription plan created successfully!");
        setTimeout(() => navigate("/admin/subscriptions-list"), 2000);
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
    navigate("/admin/subscriptions-list");
  };

  const handleCancel = () => {
    navigate("/admin/subscriptions-list");
  };

  const formatPrice = (price: number, duration: string) => {
    if (price === 0) return "Free";
    const currency = "₹";
    const durationLabel =
      duration === "monthly"
        ? "/month"
        : duration === "half-year"
        ? "/half-year"
        : "/year";
    return `${currency}${price.toLocaleString()}${durationLabel}`;
  };

  // Input field mapping configuration
  const inputFields = [
    {
      id: "name",
      name: "name",
      label: "Plan Name *",
      type: "text",
      value: formData.name,
      placeholder: "e.g., Basic, Pro, Enterprise",
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      id: "duration",
      name: "duration",
      label: "Duration *",
      type: "select",
      value: formData.duration,
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "half-year", label: "half-year" },
        { value: "yearly", label: "Yearly" },
      ],
      required: true,
      colSpan: "md:col-span-1",
    },
    {
      id: "price",
      name: "price",
      label: "Price *",
      type: "number",
      value: formData.price,
      placeholder: "0",
      min: "0",
      step: "0.01",
      required: true,
      colSpan: "md:col-span-1",
      preview: formatPrice(formData.price, formData.duration),
    },
    {
      id: "storage",
      name: "storage",
      label: "Storage Limit",
      type: "text",
      value: formData.storage,
      placeholder: "e.g., 100GB, 1TB, Unlimited",
      required: false,
      colSpan: "md:col-span-1",
    },
  ];

  return (
    <div className="">
      <div className="max-w-7xl mx-auto ">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#FFD426]">
            Create Subscription Plan
          </h2>
          <div className="text-sm text-gray-400">
            Add a new pricing plan for your service
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111111] p-4 rounded-lg shadow-md border border-gray-800"
        >
          {/* Basic Information - Mapped Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-4 mb-6">
            {inputFields.map((field) => (
              <div key={field.id} className={field.colSpan}>
                <label
                  htmlFor={field.id}
                  className="block mb-2 text-gray-200 font-semibold"
                >
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    id={field.id}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    className="w-full bg-[#0F0F0F] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none"
                    required={field.required}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <div className="relative">
                    <span className="absolute left-3 -top-1 translate-y-1/2 transform   text-gray-400 z-10">
                      ₹
                    </span>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="w-full bg-[#0F0F0F] border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-gray-200 focus:outline-none focus:border-[#FFD426] focus:ring-1 focus:ring-[#FFD426]"
                      placeholder={field.placeholder}
                      min={field.min}
                      step={field.step}
                      required={field.required}
                    />
                    {field.preview && (
                      <div className="mt-1 text-sm text-gray-500">
                        Preview: {field.preview}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    className="w-full bg-[#0F0F0F] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="ideal"
              className="block mb-2 text-gray-200 font-semibold"
            >
              Plan Description *
            </label>
            <textarea
              id="ideal"
              name="ideal"
              value={formData.ideal}
              onChange={handleChange}
              className="w-full bg-[#0F0F0F] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none"
              placeholder="Describe who this plan is ideal for and what it offers..."
              rows={4}
              required
            />
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-gray-200 font-semibold">
                Plan Features *
              </label>
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
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      className="w-full bg-[#0F0F0F] border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-[#FFD426] focus:ring-2 focus:ring-[#FFD426]/30"
                      placeholder="e.g., Storage - 100 GB"
                      required
                    />
                  </div>
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-3 text-red-500 hover:bg-red-900/30 rounded-lg transition"
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
                className="w-5 h-5 text-[#FFD426] bg-[#0F0F0F] border-2 border-gray-600 rounded focus:ring-[#FFD426] focus:ring-2"
              />
              <label
                htmlFor="mostPopular"
                className="ml-3 text-gray-300 font-medium"
              >
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
                className="w-5 h-5 text-[#FFD426] bg-[#0F0F0F] border-2 border-gray-600 rounded focus:ring-[#FFD426] focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="ml-3 text-gray-300 font-medium"
              >
                Active Plan
              </label>
            </div>
          </div>

          {/* Preview Card */}
          <div className="mb-8 p-4 bg-[#0F0F0F] rounded-lg border-2 border-dashed border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-[#FFD426]">
              Preview
            </h3>
            <div className="bg-[#111111] p-4 rounded-lg border border-gray-700 shadow-sm max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-100">
                  {formData.name || "Plan Name"}
                </h4>
                {formData.mostPopular && (
                  <span className="px-2 py-1 bg-[#FFD426]/20 text-[#FFD426] text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[#FFD426] mb-2">
                {formatPrice(formData.price, formData.duration)}
              </div>
              <div className="text-sm text-gray-400 mb-3">
                {formData.ideal || "Plan description will appear here..."}
              </div>
              <div className="space-y-1">
                {formData.features
                  .filter((f) => f.trim())
                  .map((feature, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-300 flex items-center"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                {formData.features.filter((f) => f.trim()).length === 0 && (
                  <div className="text-sm text-gray-600">
                    No features added yet...
                  </div>
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
