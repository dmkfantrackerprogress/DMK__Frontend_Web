"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

// assign dropdown options data type
interface Option {
  id: number;
  label: string;
}

// table listing data type
interface CollectionsRow {
  id: number;
  name: string;
  typeId: number;
  typeLabel: string | null;
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

export default function CollectionPage() {
  const [filters, setFilters] = useState({
    name: "",
    typeId: "",
    fromDate: "",
    toDate: "",
  });

  const [name_filter, setNameFilter] = useState<Option[]>([]);
  const [type_filter, setTypeFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<CollectionsRow[]>([]);
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
    typeId: null as number | null,
  });

  // Dropdown option when pass string value for filters
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
    const [selectedCollection, setSelectedCollection] = useState<CollectionsRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editType, setEditType] = useState<Option[]>([]); // for edit collection type dropdown
    const [loadingType, setLoadingType] = useState(false); // for edit collection type dropdown loading state

  // ===============================
  // FETCH COLLECTION DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("collections_name");
    fetchDropdown("collections_types");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "collections_name") {
      setNameFilter(data.dropdown);
    }

    if (type === "collections_types") {
      setTypeFilter(data.dropdown);
    }
  };

  // ===============================
  // FETCH TYPE WHEN TYPE CHANGE
  // ===============================
  const handleTypeChange = async (value: string) => {
    setFilters({ ...filters, typeId: value });
  
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

  if (customFilters.typeId)
    params.typeId = customFilters.typeId;

  if (customFilters.name)
    params.name = customFilters.name;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/collections/getCollectionList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.collections || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

  // create collection
  const handleCreate = async () => {
  setMessage("");
  setError("");
  setSuccess(false);

  if (!createData.name || !createData.typeId) {
    setError("Please fill all fields.");
    return;
  }

  const res = await fetch("/api/admin/collections/create", {
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
    typeId: null as number | null,
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

  setMessage("");
  setError("");

  // reset form
  setCreateData({
    name: "",
    typeId: null,
  });
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: CollectionsRow) => {
    setSelectedCollection(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");

    // Fetch collection types status for dropdown
    setLoadingType(true);
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "collections_types"}),
    });
    const data = await res.json();
    setEditType(data.dropdown || []);
    setLoadingType(false);
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    if (!selectedCollection) return;

    const updated = {
        ...selectedCollection,
        name: createData.name || selectedCollection.name,
        typeId: createData.typeId ?? selectedCollection.typeId,
    };

   const res = await fetch("/api/admin/collections/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, name: updated.name, typeId: updated.typeId}),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message);
        return;
    }

    setMessage(data.message);

    setRows(rows.map((r) => (r.id === selectedCollection.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;

    await fetch("/api/admin/collections/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedCollection.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedCollection.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      name: "",
      typeId: "",
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
          Collection 
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

        {/* Collection Name */}
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

        {/* Collection Types */}

        <Select
            options={type_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.typeId !== ""
                ? type_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.typeId)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                typeId: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Collection Type"
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
            filters.typeId ||
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

      {/* ================= CREATE Collection MODAL ================= */}
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

            <h2 className="text-lg font-bold mb-4">Create Collection</h2>

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

              {/* Collection Name */}
              <input
                    type="text"
                    placeholder="Collection Name"
                    required
                    className="w-full border p-2 rounded text-black dark:text-black-100"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    disabled={loading}
                    autoComplete="off"
                />

                {/* Collection Type */}
                <Select
                options={type_filter.map((c) => ({
                    value: c.id,
                    label: c.label,
                }))}
                value={
                    type_filter
                    .map((c) => ({
                        value: c.id,
                        label: c.label,
                    }))
                    .find((option) => option.value === Number(createData.typeId)) || null
                }
                onChange={(selected) =>
                    setCreateData({
                    ...createData,
                    typeId: selected?.value ?? null,
                    })
                }
                placeholder="Select Collection Type"
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
              <th className="p-2 border">Collection Type</th>
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
                  <td className="p-2 border">{row.typeLabel}</td>
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
      {viewModalOpen && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Collection</h2>

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

            <div className="space-y-2 text-black dark:text-black-100">
                <p>
                    <strong>Name:</strong>{" "}
                        {isEditMode ? (
                            <input
                            type="text"
                            placeholder="Collection Name"
                            required
                            className="w-full border p-2 rounded text-black dark:text-black-100"
                            value={createData.name || selectedCollection.name}
                            onChange={(e) =>
                                setCreateData({ ...createData, name: e.target.value })
                            }
                            disabled={loading}
                            autoComplete="off"
                            />
                        ) : (
                            selectedCollection.name
                        )}
                </p>
                <p>
                    <strong>Collection Type:</strong>{" "}
                    {isEditMode ? (
                    <Select
                        options={editType.map(l => ({ value: l.id, label: l.label }))}
                        value={editType.map(l => ({ value: l.id, label: l.label }))
                        .find(o => o.value === selectedCollection.typeId) || null}
                        onChange={selected => selectedCollection && setSelectedCollection({ ...selectedCollection, typeId: selected?.value || selectedCollection.typeId, typeLabel: selected?.label || selectedCollection.typeLabel })}
                        placeholder="Select Collection Type"
                        isClearable
                        isDisabled={loadingType}
                        styles={{
                        control: base => ({ ...base, backgroundColor: "transparent" }),
                        singleValue: base => ({ ...base, color: "inherit" }),
                        }}
                    />
                    ) : selectedCollection.typeLabel}
                </p>
                <p><strong>Created At:</strong> {selectedCollection.createdAt ? new Date(selectedCollection.createdAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Created By:</strong> {selectedCollection.createdByLabel || "N/A"}</p>
                <p><strong>Updated At:</strong> {selectedCollection.updatedAt ? new Date(selectedCollection.updatedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Updated By:</strong> {selectedCollection.updatedByLabel || "N/A"}</p>
                <p><strong>Deleted At:</strong> {selectedCollection.deletedAt ? new Date(selectedCollection.deletedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Deleted By:</strong> {selectedCollection.deletedByLabel || "N/A"}</p>
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