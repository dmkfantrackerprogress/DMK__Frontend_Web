"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

// assign filter options type
interface Option {
  id: number;
  label: string;
}

interface CollectionTypeRow {
  id: number;
  name: string;
  status: number | null;
  statusLabel: string | null;
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

export default function CollectionTypePage() {
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [name_filter, setNameFilter] = useState<Option[]>([]);
  const [status_filter, setStatusFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<CollectionTypeRow[]>([]);
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

  const nameOptions: DropdownOption[] = name_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCollectionType, setSelectedCollectionType] = useState<CollectionTypeRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editLevels, setEditLevels] = useState<Option[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(false);

  // ===============================
  // FETCH COLLECTION TYPES DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("collection_types_status");
    fetchDropdown("collection_types_name");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "collection_types_status") {
      setStatusFilter(data.dropdown);
    }

    if (type === "collection_types_name") {
      setNameFilter(data.dropdown);
    }
  };

  // ===============================
  // FETCH STATUS WHEN STATUS CHANGE
  // ===============================
  const handleStatusChange = async (value: string) => {
    setFilters({ ...filters, status: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH NAME WHEN NAME CHANGE
  // ===============================
  const handleNameChange = async (value: string) => {
    setFilters({ ...filters, name: value });
  
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

  if (customFilters.status)
    params.status = customFilters.status;

  if (customFilters.name)
    params.name = customFilters.name;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/collectiontypes/getCollectionTypesList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.collectionTypes || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

  // create character
  const handleCreate = async () => {
  setMessage("");
  setError("");
  setSuccess(false);

  if (!createData.name) {
    setError("Please fill all fields.");
    return;
  }

  const res = await fetch("/api/admin/collectiontypes/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createData),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message);
    return;
  }

  setSuccess(true);
  setMessage(data.message);

  handleFilter();

  setCreateData({
    name: "",
  });

  // auto close after 1.5s
  setTimeout(() => {
    setIsModalOpen(false);
    setMessage("");
    setSuccess(false);
    window.location.reload();
  }, 1500);
};

const handleOpenCreateModal = async () => {
  setIsModalOpen(true);

  // reset form
  setCreateData({
    name: "",
  });
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: CollectionTypeRow) => {
    setSelectedCollectionType(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);

    // Fetch collection types status for dropdown
    setLoadingLevels(true);
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "collection_types_status"}),
    });
    const data = await res.json();
    setEditLevels(data.dropdown || []);
    setLoadingLevels(false);
  };

  const handleSave = async () => {
    if (!selectedCollectionType) return;

    const updated = {
        ...selectedCollectionType,
        name: createData.name || selectedCollectionType.name,
    };

    await fetch("/api/admin/collectiontypes/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, name: updated.name }),
    });

    setRows(rows.map((r) => (r.id === selectedCollectionType.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedCollectionType) return;

    await fetch("/api/admin/collectiontypes/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedCollectionType.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedCollectionType.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      name: "",
      status: "",
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
          Collection Types
        </h1>

        <button
          onClick={handleOpenCreateModal}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
        >
          <FaPlus />
        </button>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 text-black dark:text-black-100">

        {/* Collection Types Name */}
        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={nameOptions}
            value={nameOptions.find((option) => option.value === filters.name) || null}
            onChange={(selected) =>
              handleNameChange(selected ? selected.value : "")
            }
            placeholder="Select Collection Type Name"
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

        {/* Collection Types Status */}

        <Select
            options={status_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.status !== ""
                ? status_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.status)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                status: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Status"
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
          {(filters.name ||
            filters.status ||
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

      {/* ================= CREATE Collection Types MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">Create Collection Type</h2>

            {/* Message Section */}
            {error && (
              <div className="bg-red-100 text-red-600 p-2 rounded mb-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-600 p-2 rounded mb-3">
                {message}
              </div>
            )}

            <div className="space-y-3">

              {/* Collection Types Name */}
              <input
                    type="text"
                    placeholder="Collection Type Name"
                    required
                    className="w-full border p-2 rounded text-black dark:text-black-100"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    disabled={loading}
                    autoComplete="off"
                />

              <button
                onClick={handleCreate}
                className="bg-green-600 text-black dark:text-black-100 w-full p-2 rounded hover:bg-green-700"
                disabled={loading}
              >
                Create
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md text-black dark:text-black-100">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">Name</th>
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
                  <td className="p-2 border">{row.name}</td>
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
      {viewModalOpen && selectedCollectionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Collection Type Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p>
                <strong>Name:</strong>{" "}
                    {isEditMode ? (
                        <input
                        type="text"
                        placeholder="Collection Type Name"
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.name || selectedCollectionType.name}
                        onChange={(e) =>
                            setCreateData({ ...createData, name: e.target.value })
                        }
                        disabled={loading}
                        autoComplete="off"
                        />
                    ) : (
                        selectedCollectionType.name
                    )}
                </p>
              <p><strong>Created At:</strong> {selectedCollectionType.createdAt ? new Date(selectedCollectionType.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created By:</strong> {selectedCollectionType.createdByLabel || "N/A"}</p>
              <p><strong>Updated At:</strong> {selectedCollectionType.updatedAt ? new Date(selectedCollectionType.updatedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated By:</strong> {selectedCollectionType.updatedByLabel || "N/A"}</p>
              <p><strong>Deleted At:</strong> {selectedCollectionType.deletedAt ? new Date(selectedCollectionType.deletedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Deleted By:</strong> {selectedCollectionType.deletedByLabel || "N/A"}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {!isEditMode && !confirmDelete && (
                <>
                  <button onClick={() => setIsEditMode(true)} className="bg-yellow-500 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
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