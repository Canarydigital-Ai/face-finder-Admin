import React, { useEffect, useState } from "react";
import { ActionIcon, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX, IconEye } from "@tabler/icons-react";
import { ToastContainer, toast } from "react-toastify";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog"; 
import { useNavigate } from "react-router-dom";
import type {
  DataTableColumn,
  DataTableSortStatus,
} from "mantine-datatable";
import { DataTable } from "mantine-datatable";
import { RiDeleteBin6Line } from "react-icons/ri";
import Dropdown from "../../layouts/Dropdown"; 
import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowDown } from "react-icons/io";
import Swal from "sweetalert2";
import { FaCrown, FaGoogle } from "react-icons/fa";
import { MdEmail, MdPhone, MdBusiness, MdLocationOn } from "react-icons/md";
import { 
  getUsers, 
  deleteUser, 
  type User 
} from "../../api/services/userService";

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [records, setRecords] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<User>>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers(false);
      setUsers(usersData);
      setRecords(usersData);
      
      if (usersData.length === 0) {
        console.log("No users found in Firebase collection");
      } else {
        console.log(`Loaded ${usersData.length} users from Firebase:`, usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filteredData = users.filter(({ name, email, phoneNumber, companyName, industry, subscription }) =>
      name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      email.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      phoneNumber.includes(debouncedQuery) ||
      companyName?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      industry?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(debouncedQuery.toLowerCase())
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
  }, [users, debouncedQuery, sortStatus, page, pageSize]);

  const handleView = (id: string) => {
    console.log("Navigating to:", `/admin/view-user/${id}`);
    navigate(`/admin/view-user/${id}`);
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    try {
      const result = await deleteUser(selectedUserId);
      if (result.success) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== selectedUserId)
        );
        toast.success("User deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDialogOpen(false);
      setSelectedUserId(null);
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
        setUsers((prev) =>
          prev.filter((user) => !selectedRecords.includes(user.id as any))
        );
        toast.success("Records deleted successfully!");
        setSelectedRecords([]);
      }
    } else if (selectedOption === "edit" && selectedRecords.length === 1) {
      navigate(`/admin/edit-user/${selectedRecords[0]}`);
    }
  };

  const openDialog = (id: string) => {
    setSelectedUserId(id);
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

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionStatus = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const isExpired = expiryDate < now;
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isExpired,
      daysLeft,
      status: isExpired ? 'Expired' : daysLeft <= 7 ? 'Expiring Soon' : 'Active'
    };
  };

  const columns: DataTableColumn<User>[] = [
    {
      accessor: "select",
      title: (
        <input
          type="checkbox"
          checked={
            selectedRecords.length === records.length && records.length > 0
          }
          onChange={handleSelectAllRecords}
          className="w-5 h-5 border-gray-600 bg-gray-800 rounded my-2"
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
            onClick={() => handleView(id as any)}
            title="View Details"
            className="text-yellow-400 hover:text-yellow-300 bg-gray-800 hover:bg-gray-700"
            variant="filled"
          >
            <IconEye />
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
      accessor: "profile", 
      title: "User Profile",
      render: ({ name, email, photoURL, provider }) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
              }}
            />
            {provider === 'google.com' && (
              <FaGoogle className="absolute -bottom-1 -right-1 w-4 h-4 text-red-500 bg-white rounded-full p-0.5" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{name}</p>
            <p className="text-xs text-gray-300 flex items-center gap-1">
              <MdEmail className="w-3 h-3" />
              {email}
            </p>
          </div>
        </div>
      )
    },
    { 
      accessor: "phoneNumber", 
      title: "Phone",
      render: ({ phoneNumber }) => (
        <span className="flex items-center gap-1 text-sm text-white">
          <MdPhone className="w-3 h-3 text-gray-400" />
          {phoneNumber || "N/A"}
        </span>
      )
    },
    { 
      accessor: "location", 
      title: "Location",
      render: ({ city, state, country }) => (
        <div className="text-sm">
          <span className="flex items-center gap-1 text-white">
            <MdLocationOn className="w-3 h-3 text-gray-400" />
            {[city, state, country].filter(Boolean).join(', ') || "IN"}
          </span>
        </div>
      )
    },
    { 
      accessor: "company", 
      title: "Company & Industry",
      render: ({ companyName, industry }) => (
        <div className="text-sm">
          <p className="flex items-center gap-1 font-medium text-white">
            <MdBusiness className="w-3 h-3 text-gray-400" />
            {companyName || "Canary Digital"}
          </p>
          {industry && (
            <p className="text-xs text-gray-300">{industry}</p>
          )}
        </div>
      )
    },
    { 
      accessor: "subscription", 
      title: "Subscription",
      render: ({ subscription }) => {
        const subStatus = getSubscriptionStatus(subscription.expires_at);
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold flex items-center gap-1 text-white">
                {subscription.planName === 'Pro' && <FaCrown className="w-3 h-3 text-purple-400" />}
                {subscription.planName}
              </span>
              <span className="text-xs text-gray-300">({subscription.billing})</span>
            </div>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                subStatus.status === 'Active'
                  ? "bg-green-500 text-white"
                  : subStatus.status === 'Expiring Soon'
                  ? "bg-yellow-500 text-black"
                  : "bg-red-500 text-white"
              }`}
            >
              {subStatus.status}
              {!subStatus.isExpired && ` (${subStatus.daysLeft}d)`}
            </span>
          </div>
        );
      }
    },
    {
      accessor: "createdAt",
      title: "Joined Date",
      render: ({ createdAt }) => (
        <span className="text-sm text-gray-300">
          {formatDate(createdAt)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FFD426] border-b-4 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#FFD426] mb-3">Users Management</h2>
        <div className="text-sm text-gray-400">
          Total Users: {users.length}
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4 mb-4">
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
          placeholder="Search users..."
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
            <option value="export">Export</option>
          </select>
        </div>
      </div>

      {/* DataTable with black and yellow theme */}
      <div className="border-1 border-[#ffffff5b] rounded-lg bg-[#1A1A1A] overflow-hidden ">
        <DataTable<User>
          className="whitespace-nowrap"
          records={records}
          columns={columns.filter(
            (col) => !hiddenColumns.includes(col.accessor as string)
          )} 
          totalRecords={users.length}
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
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default UsersList;