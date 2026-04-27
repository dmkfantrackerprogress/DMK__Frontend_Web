"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

// assign dropdown options data type
interface Option {
  id: number;
  label: string;
  level?: number;
}

// table listing data type
interface AttractionLevelRow {
  id: number;
  attractionId: number;
  attractionLabel: string | null;
  collectionId: number;
  collectionLabel: string | null;
  level: number | null;
  hours: number | null;
  minutes: number | null;
  seconds: number;
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

export default function AttractionLevelPage() {
  const [filters, setFilters] = useState({
    level: "",
    attractionId: "",
    collectionId: "",
    fromDate: "",
    toDate: "",
  });

  const [level_filter, setLevelFilter] = useState<Option[]>([]);
  const [attraction_filter, setAttractionFilter] = useState<Option[]>([]);
  const [collection_filter, setCollectionFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<AttractionLevelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attractionOptions, setAttractionOptions] = useState<Option[]>([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [createData, setCreateData] = useState({
    level: 0,
    hour: "",
    minute: "",
    second: "",
    attractionId: null as number | null,
    collectionId: null as number | null,
  });


  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedAttractionLevel, setSelectedAttractionLevel] = useState<AttractionLevelRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

  // ===============================
  // FETCH ATTRACTION LEVEL DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("attractions_levels");
    fetchDropdown("attractions");
    fetchDropdown("collections_name"); 
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "attractions_levels") {
      setLevelFilter(data.dropdown);
    }

    if (type === "attractions") {
      setAttractionFilter(data.dropdown);
    }

    if (type === "collections_name") {
      setCollectionFilter(data.dropdown);
    }

    if (type === "attractions_after_collection") {
      setAttractionOptions(data.dropdown);
    }
  };

  // ===============================
  // FETCH LEVEL WHEN LEVEL CHANGE
  // ===============================
  const handleLevelChange = async (value: string) => {
    setFilters({ ...filters, level: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH ATTRACTION WHEN CHARACTER CHANGE
  // ===============================
  const handleAttractionChange = async (value: string) => {
    setFilters({ ...filters, attractionId: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH COLLECTION WHEN COLLECTION CHANGE
  // ===============================
  const handleCollectionChange = async (value: string) => {
    setFilters({ ...filters, collectionId: value });
  
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

  if (customFilters.attractionId)
    params.attractionId = customFilters.attractionId;

  if (customFilters.level)
    params.level = customFilters.level;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/attractionsLevel/getAttractionLevelList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.attractionLevel || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

  // create attraction level
  const handleCreate = async () => {
  setMessage("");
  setError("");
  setSuccess(false);
  setLoading(true);

  if (createData.level == null || createData.hour === "" || createData.minute === "" || createData.second === "" || !createData.attractionId || !createData.collectionId) {
    setError("Please fill all fields.");
    setLoading(false);
    return;
  }

  const payload = {
    ...createData,
    hour: Number(createData.hour) || 0,
    minute: Number(createData.hour) || 0,
    second: Number(createData.hour) || 0,
  };

  const res = await fetch("/api/admin/attractionsLevel/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
    level: 0,
    hour: "",
    minute: "",
    second: "",
    attractionId: null as number | null,
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
    level: 0,
    hour: "",
    minute: "",
    second: "",
    attractionId: null as number | null,
    collectionId: null as number | null,
  });
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: AttractionLevelRow) => {
    setSelectedAttractionLevel(row);

    setCreateData({
        ...createData,
        second: String(row.seconds) ?? 0, // initialize the second
        hour: String(row.hours) ?? 0,
        minute: String(row.minutes) ?? 0,
    });

    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");


  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    if (!selectedAttractionLevel) return;

    const updated = {
        ...selectedAttractionLevel,
        hour:  Number(createData.hour || selectedAttractionLevel.hours) || 0, 
        minute: Number(createData.minute || selectedAttractionLevel.minutes) || 0,
        second: Number(createData.second || selectedAttractionLevel.seconds) || 0,
    };

   const res = await fetch("/api/admin/attractionsLevel/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, level: updated.level, hour: updated.hour, minute: updated.minute, second: updated.second, attractionId: updated.attractionId}),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
    }

    setMessage(data.message);

    setRows(rows.map((r) => (r.id === selectedAttractionLevel.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedAttractionLevel) return;

    await fetch("/api/admin/attractionsLevel/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedAttractionLevel.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedAttractionLevel.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
        level: "",
        attractionId: "",
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
          Attraction Level
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

        {/* Level */}
        <Select
            options={level_filter.map((l) => ({
              value: l.level,
              label: l.label,
            }))}
            value={
              filters.level !== ""
                ? level_filter
                    .map((l) => ({
                      value: l.level,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.level)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                level: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Level"
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

          {/* Attraction */}

        <Select
            options={attraction_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.attractionId !== ""
                ? attraction_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.attractionId)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                attractionId: selected ? String(selected.value) : "",
              })
            }
            placeholder="Select Attraction"
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
          {(filters.level ||
            filters.attractionId ||
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

      {/* ================= CREATE ATTRACTION LEVEL MODAL ================= */}
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

            <h2 className="text-lg font-bold mb-4">Create Attraction Level</h2>

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


                {/* Collection */}
                <p>
                    <strong>Collection:</strong>
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
                        onChange={(selected) => {
                            const collectionId = selected?.value ?? null;

                            setCreateData({
                            ...createData,
                            collectionId,
                            attractionId: null, // reset character when collection changes
                            });

                            if (collectionId) {
                                fetchDropdown("attractions_after_collection", {collectionId: collectionId,});
                            } else {
                            setAttractionOptions([]);
                            }
                        }}
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
                

                {/* Attraction */}
                <p>
                    <strong>Attraction:</strong>
                    <Select
                        options={attractionOptions.map((c) => ({
                            value: c.id,
                            label: c.label,
                        }))}
                        value={
                            attractionOptions
                            .map((c) => ({ value: c.id, label: c.label }))
                            .find((option) => option.value === Number(createData.attractionId)) || null
                        }
                        onChange={(selected) =>
                            setCreateData({
                            ...createData,
                            attractionId: selected?.value ?? null,
                            })
                        }
                        placeholder={
                            createData.collectionId
                            ? "Select Attraction"
                            : "Select Collection First"
                        }
                        isDisabled={!createData.collectionId}
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
                

                {/* Level */}
                <p>
                    <strong>Level:</strong>
                    <div className="flex items-center justify-center gap-4">

                        {/* Minus */}
                        <button
                        type="button"
                        onClick={() =>
                            setCreateData({
                            ...createData,
                            level: Math.max(0, (createData.level ?? 0) - 1),
                            })
                        }
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white text-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
                        >
                        −
                        </button>

                        {/* Level Display */}
                        <div className="w-20 text-center border rounded-lg py-2 text-lg font-semibold bg-white-50 dark:bg-white-800">
                        {createData.level ?? 0}
                        </div>

                        {/* Plus */}
                        <button
                        type="button"
                        onClick={() =>
                            setCreateData({
                            ...createData,
                            level: Math.min(100, (createData.level ?? 0) + 1),
                            })
                        }
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600 transition disabled:opacity-50"
                        >
                        +
                        </button>

                    </div>
                </p>
                

                {/* Hour */}
                <p>
                    <strong>Hour:</strong>
                    <input
                        type="number"
                        placeholder="Hour"
                        min={0}
                        max={24}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.hour}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            hour: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
                    />
                </p>
                
                {/* Minutes */}
                <p>
                    <strong>Minutes:</strong>
                    <input
                        type="number"
                        placeholder="Minutes"
                        min={0}
                        max={59}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.minute}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            minute: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
                    />
                </p>
                               
                {/* Seconds */}
                <p>
                    <strong>Seconds:</strong>
                    <input
                        type="number"
                        placeholder="Seconds"
                        min={0}
                        max={59}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.second}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            second: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
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
              <th className="p-2 border">Collection</th>
              <th className="p-2 border">Attraction</th> 
              <th className="p-2 border">Level</th>       
              <th className="p-2 border">Hour</th> 
              <th className="p-2 border">Minute</th> 
              <th className="p-2 border">Second</th>   
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
                  <td className="p-2 border">{row.collectionLabel}</td>
                  <td className="p-2 border">{row.attractionLabel}</td>
                  <td className="p-2 border text-center">{row.level ?? 0}</td>
                  <td className="p-2 border text-center">{row.hours ?? 0}</td>
                  <td className="p-2 border text-center">{row.minutes ?? 0}</td>
                  <td className="p-2 border text-center">{row.seconds ?? 0}</td>
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
      {viewModalOpen && selectedAttractionLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Attraction Level</h2>

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
                <p><strong>Collection:</strong> {selectedAttractionLevel.collectionLabel}</p>
                <p><strong>Attraction:</strong> {selectedAttractionLevel.attractionLabel}</p>
                <p><strong>Level:</strong> {selectedAttractionLevel.level}</p>
                <p>
                <strong>Hour:</strong>{" "}
                    {isEditMode ? (
                        <input
                        type="number"
                        placeholder="Hour"
                        min={0}
                        max={24}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.hour ?? ""}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            hour: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
                        />
                    ) : (
                        selectedAttractionLevel?.hours ?? 0
                    )}
                </p>
                <p>
                <strong>Minute:</strong>{" "}
                    {isEditMode ? (
                        <input
                        type="number"
                        placeholder="Minute"
                        min={0}
                        max={59}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.minute ?? ""}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            minute: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
                        />
                    ) : (
                        selectedAttractionLevel?.minutes ?? 0
                    )}
                </p>
                <p>
                <strong>Second:</strong>{" "}
                    {isEditMode ? (
                        <input
                        type="number"
                        placeholder="Second"
                        min={0}
                        max={59}
                        step={1}
                        required
                        className="w-full border p-2 rounded text-black dark:text-black-100"
                        value={createData.second ?? ""}
                        onChange={(e) =>
                            setCreateData({
                            ...createData,
                            second: e.target.value ?? 0,
                            })
                        }
                        disabled={loading}
                        autoComplete="off"
                        />
                    ) : (
                        selectedAttractionLevel?.seconds ?? 0
                    )}
                </p>
                <p><strong>Created At:</strong> {selectedAttractionLevel.createdAt ? new Date(selectedAttractionLevel.createdAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Created By:</strong> {selectedAttractionLevel.createdByLabel || "N/A"}</p>
                <p><strong>Updated At:</strong> {selectedAttractionLevel.updatedAt ? new Date(selectedAttractionLevel.updatedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Updated By:</strong> {selectedAttractionLevel.updatedByLabel || "N/A"}</p>
                <p><strong>Deleted At:</strong> {selectedAttractionLevel.deletedAt ? new Date(selectedAttractionLevel.deletedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Deleted By:</strong> {selectedAttractionLevel.deletedByLabel || "N/A"}</p>
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