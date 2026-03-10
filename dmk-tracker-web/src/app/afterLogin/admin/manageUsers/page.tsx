"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

// assign filter options type
interface Option {
  id: number;
  label: string;
}

interface UserRow {
  id: number;
  email: string;
  verified: number | null;
  verifiedLabel: string | null;
  isAdmin: number | null;
  isAdminLabel: string | null;
  verifyAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: number | null;
  createdByLabel: string | null;
  updatedBy: number | null;
  updatedByLabel: string | null;
  deletedBy: number | null;
  deletedByLabel: string | null;
}

export default function UserPage() {
  const [filters, setFilters] = useState({
    email: "",
    verified: "",
    isAdmin: "",
    fromDate: "",
    toDate: "",
  });

  const [email_filter, setEmailFilter] = useState<Option[]>([]);
  const [verified_filter, setVerifiedFilter] = useState<Option[]>([]);
  const [isAdmin_filter, setIsAdminFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [createData, setCreateData] = useState({
    name: "",
  });

  // Dropdown option type
  type DropdownOption = {
    value: string;
    label: string;
  };

  const emailOptions: DropdownOption[] = email_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editIsAdmin, setEditIsAdmin] = useState<Option[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(false);

  // ===============================
  // FETCH MANAGE USERS DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("useremail");
    fetchDropdown("userRoles");
    fetchDropdown("userVerifiedStatus");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "useremail") {
      setEmailFilter(data.dropdown);
    }

    if (type === "userRoles") {
      setIsAdminFilter(data.dropdown);
    }

    if (type === "userVerifiedStatus") {
      setVerifiedFilter(data.dropdown);
    }
  };

  // ===============================
  // FETCH EMAIL WHEN EMAIL CHANGE
  // ===============================
  const handleEmailChange = async (value: string) => {
    setFilters({ ...filters, email: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH ROLES WHEN ROLES CHANGE
  // ===============================
  const handleRolesChange = async (value: string) => {
    setFilters({ ...filters, isAdmin: value });
  
    if (!value) return;

  };

   // ===============================
// FETCH VERIFIED STATUS WHEN VERIFIED STATUS CHANGE
  // ===============================
  const handleVerifiedChange = async (value: string) => {
    setFilters({ ...filters, verified: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH TABLE DATA
  // ===============================
  const handleFilter = async (pageNumber = page, customFilters = filters) => {
  setLoading(true);

  const params: any = {
    page: pageNumber,
    limit: limit,
  };

  if (customFilters.email)
    params.email = customFilters.email;

  if (customFilters.isAdmin)
    params.isAdmin = customFilters.isAdmin;

  if (customFilters.verified)
    params.verified = customFilters.verified;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/manageUsers/getUsersList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.users || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: UserRow) => {
    setSelectedUser(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);

    // Fetch user roles for dropdown
    setLoadingLevels(true);
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "userRoles"}),
    });
    const data = await res.json();
    setEditIsAdmin(data.dropdown || []);
    setLoadingLevels(false);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const updated = {
        ...selectedUser,
        isAdmin: selectedUser.isAdmin,
    };

    await fetch("/api/admin/manageUsers/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, isAdmin: updated.isAdmin }),
    });

    setRows(rows.map((r) => (r.id === selectedUser.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    await fetch("/api/admin/manageUsers/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedUser.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedUser.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      email: "",
      verified: "",
      isAdmin: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(emptyFilters);

    await handleFilter(1, emptyFilters);

  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">
          Manage Users
        </h1>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 text-black dark:text-black-100">

        {/* Email */}
        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={emailOptions}
            value={emailOptions.find((option) => option.value === filters.email) || null}
            onChange={(selected) =>
              handleEmailChange(selected ? selected.value : "")
            }
            placeholder="Select Email"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "transparent",
                borderColor: "inherit",
                color: "inherit",
              }),
              singleValue: (base) => ({
                ...base,
                color: "inherit",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "white",
              }),
              
            }}
          />

        {/* User Roles */}

        <Select
            options={isAdmin_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.isAdmin !== ""
                ? isAdmin_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.isAdmin)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                isAdmin: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Admin Status"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "transparent",
                borderColor: "inherit",
                color: "inherit",
              }),
              singleValue: (base) => ({
                ...base,
                color: "inherit",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "white",
              }),
              
            }}
          />

          {/* User Verified */}

        <Select
            options={verified_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.verified !== ""
                ? verified_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.verified)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                verified: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select User Verified Status"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "transparent",
                borderColor: "inherit",
                color: "inherit",
              }),
              singleValue: (base) => ({
                ...base,
                color: "inherit",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "white",
              }),
              
            }}
          />

        {/* From Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.fromDate}
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
        />

        {/* To Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.toDate}
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
        />

        {/* Filter Button */}
        <button
          onClick={() => handleFilter(1)}
          className="bg-blue-600 text-black dark:text-black-100 rounded p-2"
        >
          {loading ? "Loading..." : "Filter"}
        </button>

          {/* Reset Button */}
          {(filters.email ||
            filters.verified ||
            filters.isAdmin ||
            filters.fromDate ||
            filters.toDate) && (
            <button
              onClick={handleResetFilter}
              className="bg-gray-500 rounded p-2 hover:bg-gray-600 transition text-black dark:text-black-100"
            >
              Reset
            </button>
          )}
      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md text-black dark:text-black-100">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Admin</th>
              <th className="p-2 border">Verified</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No data found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="p-2 border text-center">{row.id}</td>
                  <td className="p-2 border">{row.email}</td>
                  <td className="p-2 border">{row.isAdminLabel}</td>
                    <td className="p-2 border">{row.verifiedLabel}</td>
                  <td className="p-2 border text-center">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => openViewModal(row)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">

          <div className="text-sm text-gray-600">
            Total: {total}
          </div>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() => handleFilter(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-3 py-1">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => handleFilter(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

            {/* ================= VIEW / EDIT MODAL ================= */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">User Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Verified:</strong> {selectedUser.verifiedLabel}</p>
              <p>
                <strong>Admin:</strong>{" "}
                {isEditMode ? (
                  <Select
                    options={editIsAdmin.map(l => ({ value: l.id, label: l.label }))}
                    value={editIsAdmin.map(l => ({ value: l.id, label: l.label }))
                      .find(o => o.value === selectedUser.isAdmin) ?? null}
                    onChange={(selected) => { if (!selectedUser) return; setSelectedUser({...selectedUser, isAdmin: selected?.value ?? selectedUser.isAdmin});}}
                    placeholder="Select Admin Status"
                    isClearable
                    isDisabled={loadingLevels}
                    styles={{
                      control: base => ({ ...base, backgroundColor: "transparent" }),
                      singleValue: base => ({ ...base, color: "inherit" }),
                    }}
                  />
                ) : selectedUser.isAdminLabel}
              </p>
              <p><strong>Verified At:</strong> {selectedUser.verifyAt ? new Date(selectedUser.verifyAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created At:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created By:</strong> {selectedUser.createdByLabel || "N/A"}</p>
              <p><strong>Updated At:</strong> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated By:</strong> {selectedUser.updatedByLabel || "N/A"}</p>
              <p><strong>Deleted At:</strong> {selectedUser.deletedAt ? new Date(selectedUser.deletedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Deleted By:</strong> {selectedUser.deletedByLabel || "N/A"}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {!isEditMode && !confirmDelete && (
                <>
                  {/*<button onClick={() => setIsEditMode(true)} className="bg-yellow-500 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-yellow-600">Edit</button>*/}
                  {/*<button onClick={() => setConfirmDelete(true)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>*/}
                </>
              )}

              {isEditMode && <button onClick={handleSave} className="bg-green-600 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-green-700" disabled={loading}>Save</button>}

              {confirmDelete && (
                <>
                  <p className="text-red-600 mr-auto">Are you sure?</p>
                  <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400">Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>    
  );
}