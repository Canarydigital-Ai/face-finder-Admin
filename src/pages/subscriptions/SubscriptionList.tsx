import React, { useEffect, useState } from "react";
import { ActionIcon, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { ToastContainer, toast } from "react-toastify";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog"; 
import { useNavigate } from "react-router-dom";
import type {
  DataTableColumn,
  DataTableSortStatus,
} from "mantine-datatable";
import { DataTable } from "mantine-datatable";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import Dropdown from "../../layouts/Dropdown"; 
import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowDown } from "react-icons/io";
import Swal from "sweetalert2";
import { FaPlus, FaCrown, FaFire } from "react-icons/fa";
import { 
  getSubscriptions, 
  deleteSubscription, 
  type Subscription 
} from "../../api/services/subscriptionService";

const SubscriptionsList: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [records, setRecords] = useState<Subscription[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Subscription>>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const subscriptionsData = await getSubscriptions(false);
      setSubscriptions(subscriptionsData);
      setRecords(subscriptionsData);
      
      if (subscriptionsData.length === 0) {
        console.log("No subscriptions found in Firebase collection");
      } else {
        console.log(`Loaded ${subscriptionsData.length} subscriptions from Firebase:`, subscriptionsData);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filteredData = subscriptions.filter(({ name, ideal, duration, storage }) =>
      name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      ideal.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      duration.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      storage?.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    const sortedData = filteredData.sort((a: any, b: any) => {
      const accessor = sortStatus.columnAccessor;

      if (!accessor) {
        return 0;
      }

      if (!(accessor in a)) {
        return 0;
      }

      return sortStatus.direction === "asc"
        ? a[accessor] > b[accessor]
          ? 1
          : -1
        : a[accessor] < b[accessor]
        ? 1
        : -1;
    });

    setRecords(sortedData.slice((page - 1) * pageSize, page * pageSize));
  }, [subscriptions, debouncedQuery, sortStatus, page, pageSize]);

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-subscription/${id}`);
  };

  const handleDelete = async () => {
    if (!selectedSubscriptionId) return;

    try {
      const result = await deleteSubscription(selectedSubscriptionId);
      if (result.success) {
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.filter((subscription) => subscription.id !== selectedSubscriptionId)
        );
        toast.success("Subscription deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete subscription. Please try again.");
    } finally {
      setIsDialogOpen(false);
      setSelectedSubscriptionId(null);
    }
  };

  const toggleColumnVisibility = (columnAccessor: string) => {
    setHiddenColumns((prevHiddenColumns) => {
      if (prevHiddenColumns.includes(columnAccessor)) {
        return prevHiddenColumns.filter((col) => col !== columnAccessor);
      } else {
        return [...prevHiddenColumns, columnAccessor];
      }
    });
  };

  const handleSelectChange = async (selectedOption: string) => {
    if (selectedOption === "delete" && selectedRecords.length > 0) {
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You won't be able to revert these changes!",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        padding: "2em",
      });
      
      if (confirmation.isConfirmed) {
        setSubscriptions((prev) =>
          prev.filter((subscription) => !selectedRecords.includes(subscription.id as any))
        );
        toast.success("Records deleted successfully!");
        setSelectedRecords([]);
      }
    } else if (selectedOption === "edit" && selectedRecords.length === 1) {
      navigate(`/admin/edit-subscription/${selectedRecords[0]}`);
    }
  };

  const openDialog = (id: string) => {
    setSelectedSubscriptionId(id);
    setIsDialogOpen(true);
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAllRecords = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map((record) => record.id ?? ''));
    }
  };

  const handleCreate = () => {
    navigate("/admin/create-subscription");
  };

  const formatPrice = (price: number, duration: string) => {
    if (price === 0) return "Free";
    const currency = "₹";
    const durationLabel = duration === "monthly" ? "/month" : 
                         duration === "HalfYear" ? "/Half Year" : "/year";
    return `${currency}${price.toLocaleString()}${durationLabel}`;
  };

  const columns: DataTableColumn<Subscription>[] = [
    {
      accessor: "select",
      title: (
        <input
          type="checkbox"
          checked={
            selectedRecords.length === records.length && records.length > 0
          }
          onChange={handleSelectAllRecords}
          className="w-5 h-5  border-gray-600 bg-gray-800 rounded my-2"
        />
      ),
      render: ({ id } ) => (
        <input
          type="checkbox"
          checked={selectedRecords.includes(id as any)}
          onChange={() => handleSelectRecord(id as any)}
          className="w-5 h-5 border-gray-600 bg-gray-800 rounded"
        />
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: ({ id }) => (
        <div className="flex items-center space-x-1 py-2">
          <ActionIcon
            onClick={() => handleEdit(id as any)}
            title="Edit"
            className="text-yellow-400 hover:text-yellow-300 bg-gray-800 hover:bg-gray-700"
            variant="filled"
          >
            <FiEdit />
          </ActionIcon>
          <ActionIcon
            onClick={() => openDialog(id as any)}
            title="Delete"
            className="text-red-400 hover:text-red-300 bg-gray-800 hover:bg-gray-700"
            variant="filled"
          >
            <RiDeleteBin6Line />
          </ActionIcon>
        </div>
      ),
    },
    { 
      accessor: "name", 
      title: "Plan Name",
      render: ({ name, mostPopular }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{name}</span>
          {mostPopular && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full">
              <FaFire className="w-3 h-3" />
              Popular
            </span>
          )}
          {name === "Pro" && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
              <FaCrown className="w-3 h-3" />
              Pro
            </span>
          )}
        </div>
      )
    },
    { 
      accessor: "price", 
      title: "Price",
      render: ({ price, duration }) => (
        <span className="font-medium text-[#FCCA00]">
          {formatPrice(price, duration)}
        </span>
      )
    },
    { 
      accessor: "duration", 
      title: "Duration",
      render: ({ duration }) => (
        <span className="capitalize px-4 py-2 bg-yellow-500 text-black text-xs font-medium rounded-full">
          {duration === "HalfYear" ? "Half Year" : duration}
        </span>
      )
    },
    { 
      accessor: "storage", 
      title: "Storage",
      render: ({ storage, features }) => (
        <span className="text-sm text-white">
          {storage || features.find(f => f.includes("Storage"))?.split(" - ")[1] || "N/A"}
        </span>
      )
    },
    { 
      accessor: "ideal", 
      title: "Description",
      render: ({ ideal }) => (
        <span className="text-sm text-gray-300 max-w-xs truncate block">
          {ideal}
        </span>
      )
    },
    {
      accessor: "isActive",
      title: "Status",
      render: ({ isActive }) => (
        <span
          className={`px-4 py-2 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FFD426] border-b-4 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#FFD426] mb-3">Subscription Plans</h2>
        <div className="text-sm text-gray-400">
          Total Plans: {subscriptions.length}
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4 mb-4">
        <button
          className="flex-1 h-11 bg-[#FFD426] text-black rounded-md hover:bg-[#e6b800] transition flex items-center justify-center font-semibold"
          onClick={handleCreate}
        >
          <FaPlus className="mr-2" /> Add Subscription Plan
        </button>

        <div className="flex-1">
          <Dropdown
            btnClassName="w-full flex items-center border border-gray-600 rounded-md px-4 py-2 text-sm bg-gray-800 text-white shadow-sm hover:bg-gray-700"
            button={
              <>
                <span className="mr-1">Columns</span>
                <IoIosArrowDown />
              </>
            }
          >
            <div className="absolute z-10 bg-gray-800 bg-opacity-95 rounded-md shadow-md p-4">
              <ul className="min-w-[300px] max-h-60 overflow-y-auto">
                {columns
                  .filter((col) => col.accessor !== "select")
                  .map((col, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex items-center px-4 py-1">
                        <label className="cursor-pointer mb-0 text-white">
                          <input
                            type="checkbox"
                            checked={
                              !hiddenColumns.includes(col.accessor as string)
                            }
                            className="mr-2 text-yellow-500"
                            onChange={() =>
                              toggleColumnVisibility(col.accessor as string)
                            }
                          />
                          {col.title}
                        </label>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </Dropdown>
        </div>

        <TextInput
          placeholder="Search subscriptions..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} className="text-gray-400" />}
          rightSection={
            <ActionIcon
              size="sm"
              variant="transparent"
              onClick={() => setQuery("")}
              className="text-gray-400"
            >
              <IconX size={14} />
            </ActionIcon>
          }
          className="flex-1 bg-gray-800 border-gray-600 text-white"
          styles={{
            input: {
              backgroundColor: '#1e2939',
              height: '44px',
              borderColor: '#333',
              color: 'white',
              '&::placeholder': {
                color: '#999',
              },
            },
          }}
        />

        <div className="flex-1">
          <select
            className="form-select border border-gray-600 rounded-md px-4 py-2 text-sm bg-gray-800 text-white shadow-sm hover:bg-gray-700 w-full"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleSelectChange(e.target.value)
            }
          >
            <option value="">Action Dropdown</option>
            <option value="edit">Edit</option>
            <option value="delete">Delete</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
          </select>
        </div>
      </div>

      {/* DataTable with black and yellow theme */}
      <div className="border-1 border-[#ffffff5b] rounded-lg bg-[#1A1A1A] overflow-hidden ">
        <DataTable<Subscription>
          className="whitespace-nowrap"
          records={records}
          columns={columns.filter(
            (col) => !hiddenColumns.includes(col.accessor as string)
          )} 
          totalRecords={subscriptions.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          minHeight={200}
          paginationText={({ from, to, totalRecords }) => (
            <span className="text-[#FCCA00]">
              Showing {from} to {to} of {totalRecords} entries
            </span>
          )}
          styles={{
            root: {
              backgroundColor: '#000000',
            },
            table: {
              backgroundColor: '#1A1A1A',
            },
            header: {
              backgroundColor: '#1A1A1A',
              color: '#FCCA00',
              fontSize: '16px',
            },
            pagination: {
              backgroundColor: '#1A1A1A',
              color: '#FFD426', 
              fontSize: '16px', 
            },
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription plan? This action cannot be undone."
      />
    </div>
  );
};

export default SubscriptionsList;