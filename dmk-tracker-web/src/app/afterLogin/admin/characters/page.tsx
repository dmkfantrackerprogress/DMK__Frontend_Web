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
interface CharacterRow {
  id: number;
  name: string;
  collectionId: number;
  collectionLabel: string | null;
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

export default function CharacterPage() {
  const [filters, setFilters] = useState({
    name: "",
    collectionId: "",
    fromDate: "",
    toDate: "",
  });

  const [name_filter, setNameFilter] = useState<Option[]>([]);
  const [collection_filter, setCollectionFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<CharacterRow[]>([]);
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
    collectionId: null as number | null,
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
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editCollection, setEditCollection] = useState<Option[]>([]); // for edit collection dropdown
    const [loadingCollection, setLoadingCollection] = useState(false); // for edit collection  dropdown loading state

  // ===============================
  // FETCH COLLECTION DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("collections_name");
    fetchDropdown("characters");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "characters") {
      setNameFilter(data.dropdown);
    }

    if (type === "collections_name") {
      setCollectionFilter(data.dropdown);
    }
  };

  // ===============================
  // FETCH COLLECTION WHEN COLLECTION CHANGE
  // ===============================
  const handleCollectionChange = async (value: string) => {
    setFilters({ ...filters, collectionId: value });
  
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

  if (customFilters.collectionId)
    params.collectionId = customFilters.collectionId;

  if (customFilters.name)
    params.name = customFilters.name;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/characters/getCollectionCharactersList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.characters || []);

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
  setLoading(true);

  if (!createData.name || !createData.collectionId) {
    setError("Please fill all fields.");
    setLoading(false);
    return;
  }

  const res = await fetch("/api/admin/characters/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createData),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message);
    setLoading(false);
    return;
  }

  setSuccess(true);
  setMessage(data.message);

  handleFilter();

  setCreateData({
    name: "",
    collectionId: null as number | null,
  });

  // auto close after 1.5s
  setTimeout(() => {
    setIsModalOpen(false);
    setMessage("");
    setSuccess(false);
    setLoading(false);
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
    collectionId: null,
  });
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: CharacterRow) => {
    setSelectedCharacter(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");

    // Fetch collection for dropdown
    setLoadingCollection(true);
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "collections_name"}),
    });
    const data = await res.json();
    setEditCollection(data.dropdown || []);
    setLoadingCollection(false);
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    if (!selectedCharacter) return;

    const updated = {
        ...selectedCharacter,
        name: createData.name || selectedCharacter.name,
        collectionId: createData.collectionId ?? selectedCharacter.collectionId,
    };

   const res = await fetch("/api/admin/characters/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, name: updated.name, collectionId: updated.collectionId}),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
    }

    setMessage(data.message);

    setRows(rows.map((r) => (r.id === selectedCharacter.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedCharacter) return;

    await fetch("/api/admin/characters/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedCharacter.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedCharacter.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      name: "",
      collectionId: "",
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
          Character 
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

        {/* Characters */}
        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={nameOptions}
            value={nameOptions.find((option) => option.value === filters.name) || null}
            onChange={(selected) =>
              handleNameChange(selected ? selected.value : "")
            }
            placeholder="Select Character"
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

        {/* Collection */}

        <Select
            options={collection_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.collectionId !== ""
                ? collection_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.collectionId)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                collectionId: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Collection"
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
            filters.collectionId ||
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

            <h2 className="text-lg font-bold mb-4">Create Character</h2>

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

              {/* Character Name */}
              <p>
                <strong className="text-black dark:text-black-100">Character Name:</strong>
                <input
                    type="text"
                    placeholder="Character Name"
                    required
                    className="w-full border p-2 rounded text-black dark:text-black-100"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    disabled={loading}
                    autoComplete="off"
                />
              </p>
              
                {/* Collection */}
                <p>
                  <strong className="text-black dark:text-black-100">Collection:</strong>
                  <Select
                    options={collection_filter.map((c) => ({
                        value: c.id,
                        label: c.label,
                    }))}
                    value={
                        collection_filter
                        .map((c) => ({
                            value: c.id,
                            label: c.label,
                        }))
                        .find((option) => option.value === Number(createData.collectionId)) || null
                    }
                    onChange={(selected) =>
                        setCreateData({
                        ...createData,
                        collectionId: selected?.value ?? null,
                        })
                    }
                    placeholder="Select Collection"
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
                </p>
                
              <button
                onClick={handleCreate}
                className="bg-green-600 text-black dark:text-black-100 w-full p-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
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
              <th className="p-2 border">Collection</th>
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
                  <td className="p-2 border">{row.collectionLabel}</td>
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
      {viewModalOpen && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Character</h2>

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
                    <strong>Collection:</strong>{" "}
                    {isEditMode ? (
                    <Select
                        options={editCollection.map(l => ({ value: l.id, label: l.label }))}
                        value={editCollection.map(l => ({ value: l.id, label: l.label }))
                        .find(o => o.value === selectedCharacter.collectionId) || null}
                        onChange={selected => selectedCharacter && setSelectedCharacter({ ...selectedCharacter, collectionId: selected?.value || selectedCharacter.collectionId, collectionLabel: selected?.label || selectedCharacter.collectionLabel })}
                        placeholder="Select Collection"
                        isClearable
                        isDisabled={loadingCollection}
                        styles={{
                        control: base => ({ ...base, backgroundColor: "transparent" }),
                        singleValue: base => ({ ...base, color: "inherit" }),
                        }}
                    />
                    ) : selectedCharacter.collectionLabel}
                </p>
                <p><strong>Character Name:</strong> {selectedCharacter.name}</p>
                <p><strong>Created At:</strong> {selectedCharacter.createdAt ? new Date(selectedCharacter.createdAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Created By:</strong> {selectedCharacter.createdByLabel || "N/A"}</p>
                <p><strong>Updated At:</strong> {selectedCharacter.updatedAt ? new Date(selectedCharacter.updatedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Updated By:</strong> {selectedCharacter.updatedByLabel || "N/A"}</p>
                <p><strong>Deleted At:</strong> {selectedCharacter.deletedAt ? new Date(selectedCharacter.deletedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Deleted By:</strong> {selectedCharacter.deletedByLabel || "N/A"}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {!isEditMode && !confirmDelete && (
                <>
                  <button onClick={() => setIsEditMode(true)} className="bg-yellow-500 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                  {/*<button onClick={() => setConfirmDelete(true)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>*/}
                </>
              )}

              {isEditMode && <button onClick={handleSave} className="bg-green-600 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50" disabled={loading}>{loading ? "Saving..." : "Save"}</button>}

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