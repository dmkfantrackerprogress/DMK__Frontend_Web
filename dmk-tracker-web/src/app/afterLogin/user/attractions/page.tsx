"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

interface Option {
  id: number;
  label: string;
  level?: number;
}

interface AttractionRow {
  id: number;
  collectionLabel: string;
  attractionLabel: string;
  attractionId: number;
  collectionId: number;
  level: number | null;
  createdAt: string;
  maxLevel: number;
  levelsRemaining: number;
  timeToMax: string;
}

export default function UserAttractionPage() {
  const [filters, setFilters] = useState({
    collectionId: "",
    attractionId: "",
    level: "",
    fromDate: "",
    toDate: "",
  });

  const [collections_registered, setCollectionsRegistered] = useState<Option[]>([]);
  const [attractions_registered, setAttractionsRegistered] = useState<Option[]>([]);
  const [levels_registered, setLevelsRegistered] = useState<Option[]>([]);
  const [collections_attractions, setCollectionsAttractions] = useState<Option[]>([]);
  const [attractions, setAttractions] = useState<Option[]>([]);
  const [levels, setLevels] = useState<Option[]>([]);
  const [rows, setRows] = useState<AttractionRow[]>([]);
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
    collectionId: "",
    attractionId: "",
    level: "",
  });

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState<AttractionRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editLevels, setEditLevels] = useState<Option[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(false);

  // ===============================
  // FETCH COLLECTION DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("collections_attractions_registered");
    fetchDropdown("attractions_registered");
    fetchDropdown("attraction_levels_registered");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/user/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "collections_attractions_registered") {
      setCollectionsRegistered(data.dropdown);
    }

    if (type === "attractions_registered") {
      setAttractionsRegistered(data.dropdown);
    }

    if (type === "attraction_levels_registered") {
      setLevelsRegistered(data.dropdown);
    }

    if (type === "collections_attractions") {
      setCollectionsAttractions(data.dropdown);
    }

    if (type === "attractions") {
      setAttractions(data.dropdown);
    }

    if (type === "attraction_levels") {
      setLevels(data.dropdown);
    }
  };

  // ===============================
  // FETCH ATTRACTION WHEN COLLECTION CHANGE
  // ===============================
  const handleCollectionChange = async (value: string) => {
    setFilters({ ...filters, collectionId: value, attractionId: "", level: "" });
    setAttractionsRegistered([]);
    setLevelsRegistered([]);

    if (!value) return;

    await fetchDropdown("attractions_registered", {
      collectionId: Number(value),
    });

    await fetchDropdown("attraction_levels_registered", {
      attractionId: Number(value),
    });
  };

  // ===============================
  // FETCH LEVEL WHEN ATTRACTION CHANGE
  // ===============================
  const handleAttractionChange = async (value: string) => {
    setFilters({ ...filters, attractionId: value, level: "" });
    setLevelsRegistered([]);

    if (!value) return;

    await fetchDropdown("attraction_levels_registered", {
      attractionId: Number(value),
    });
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

    if (customFilters.level !== "")
      params.level = customFilters.level;

    if (customFilters.fromDate)
      params.fromDate = customFilters.fromDate;

    if (customFilters.toDate)
      params.toDate = customFilters.toDate;

    const query = new URLSearchParams(params);
    const res = await fetch(`/api/user/attractions/getAttractionList?${query.toString()}`);
    const data = await res.json();

    setRows(data.attractions || []);

    // pagination
    setPage(data.meta?.page || 1);
    setTotalPages(data.meta?.totalPages || 1);
    setTotal(data.meta?.total || 0);

    setLoading(false);
  };

  // create attraction
  const handleCreate = async () => {
  setMessage("");
  setError("");
  setSuccess(false);

  if (createData.collectionId === "" || createData.attractionId === "" || createData.level === "") {
    setError("Please select all fields.");
    return;
  }

  const res = await fetch("/api/user/attractions/create", {
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
    collectionId: "",
    attractionId: "",
    level: "",
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
    collectionId: "",
    attractionId: "",
    level: "",
  });

  setAttractions([]);
  setLevels([]);

  await fetchDropdown("collections_attractions");
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: AttractionRow) => {
    setSelectedAttraction(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");

    // Fetch levels for dropdown
    setLoadingLevels(true);
    const res = await fetch("/api/user/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "attraction_levels", attractionId: row.attractionId }),
    });
    const data = await res.json();
    setEditLevels(data.dropdown || []);
    setLoadingLevels(false);
  };

  const handleSaveLevel = async () => {
    setMessage("");
    setError("");
    if (!selectedAttraction) return;

    const res = await fetch("/api/user/attractions/update", {
      method: "POST",
      body: JSON.stringify({ id: selectedAttraction.id, level: selectedAttraction.level, attractionId: selectedAttraction.attractionId }),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message);
        return;
    }

    setMessage(data.message);

    setRows(rows.map((r) => (r.id === selectedAttraction.id ? selectedAttraction : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDeleteAttraction = async () => {
    if (!selectedAttraction) return;

    await fetch("/api/user/attractions/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedAttraction.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedAttraction.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    const emptyFilters = {
      collectionId: "",
      attractionId: "",
      level: "",
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
          Attraction
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

        {/* Collection */}
        <Select
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={collections_registered.map((c) => ({
              value: c.id,
              label: c.label,
            }))}
            value={
              collections_registered
                .map((c) => ({ value: c.id, label: c.label }))
                .find((option) => option.value === Number(filters.collectionId)) || null
            }
            onChange={(selected) =>
              handleCollectionChange(selected ? String(selected.value) : "")
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

        {/* Character */}

        <Select
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={attractions_registered.map((c) => ({
              value: c.id,
              label: c.label,
            }))}
            value={
              attractions_registered
                .map((c) => ({ value: c.id, label: c.label }))
                .find((option) => option.value === Number(filters.attractionId)) || null
            }
            onChange={(selected) =>
              handleAttractionChange(selected ? String(selected.value) : "")
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

        {/* Level */}
        <Select
            options={levels_registered.map((l) => ({
              value: l.level,
              label: l.label,
            }))}
            value={
              filters.level !== ""
                ? levels_registered
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
          {(filters.collectionId ||
            filters.attractionId ||
            filters.level ||
            filters.fromDate ||
            filters.toDate) && (
            <button
              onClick={handleResetFilter}
              className="bg-gray-500 text-black dark:text-black-100 rounded p-2 hover:bg-gray-600 transition"
            >
              Reset
            </button>
          )}
      </div>

      {/* ================= CREATE ATTRACTION MODAL ================= */}
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

            <h2 className="text-lg font-bold mb-4">Create Attraction</h2>

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
              <Select
                options={collections_attractions.map((c) => ({
                  value: c.id,
                  label: c.label,
                }))}
                value={
                  collections_attractions
                    .map((c) => ({
                      value: c.id,
                      label: c.label,
                    }))
                    .find(
                      (option) => option.value === Number(createData.collectionId)
                    ) || null
                }
                onChange={async (selected) => {
                  const value = selected ? selected.value : "";

                  setCreateData({
                    collectionId: value ? String(value) : "",
                    attractionId: "",
                    level: "",
                  });

                  setLevels([]);
                  setAttractions([]);

                  if (!value) return;

                  await fetchDropdown("attractions", {
                    collectionId: Number(value),
                  });
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

              {/* Attraction */}
              <Select
                options={attractions.map((c) => ({
                  value: c.id,
                  label: c.label,
                }))}
                value={
                  attractions
                    .map((c) => ({
                      value: c.id,
                      label: c.label,
                    }))
                    .find(
                      (option) =>
                        option.value === Number(createData.attractionId)
                    ) || null
                }
                onChange={async (selected) => {
                  const value = selected ? selected.value : "";

                  setCreateData({
                    ...createData,
                    attractionId: value ? String(value) : "",
                    level: "",
                  });

                  setLevels([]);

                  if (!value) return;

                  await fetchDropdown("attraction_levels", {
                    attractionId: Number(value),
                  });
                }}
                placeholder="Select Attraction"
                isClearable
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

              {/* Level */}
              <Select
                    options={levels.map((l) => ({
                      value: l.level,
                      label: l.label,
                    }))}
                    value={
                      levels
                        .map((l) => ({
                          value: l.level,
                          label: l.label,
                        }))
                        .find(
                          (option) => option.value === Number(createData.level)
                        ) || null
                    }
                    onChange={(selected) =>
                      setCreateData({
                        ...createData,
                        level: selected ? String(selected.value) : "",
                      })
                    }
                    placeholder="Select Level"
                    isClearable
                    isDisabled={!createData.attractionId}
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
              <th className="p-2 border">Collection</th>
              <th className="p-2 border">Attraction</th>
              <th className="p-2 border">Level</th>
              <th className="p-2 border">Time to Max</th>
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
                  <td className="p-2 border text-center">{row.level}</td>
                  <td className="p-2 border text-center">
                    {row.levelsRemaining === 0 ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                        ⭐ Max Level
                      </span>
                    ) : row.levelsRemaining <= 3 ? (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm">
                        ⚡ Almost Max ({row.timeToMax})
                      </span>
                    ) : (
                      row.timeToMax
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {new Date(row.createdAt).toLocaleDateString()}
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
      {viewModalOpen && selectedAttraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Character Info</h2>

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
              <p><strong>Collection:</strong> {selectedAttraction.collectionLabel}</p>
              <p><strong>Attraction:</strong> {selectedAttraction.attractionLabel}</p>
              <p>
                <strong>Level:</strong>{" "}
                {isEditMode ? (
                  <Select
                    options={editLevels.map(l => ({ value: l.level, label: l.label }))}
                    value={editLevels.map(l => ({ value: l.level, label: l.label }))
                      .find(o => o.value === selectedAttraction.level) || null}
                    onChange={(selected) => { if (!selectedAttraction) return; setSelectedAttraction({...selectedAttraction,level: selected?.value ?? selectedAttraction.level,});}}
                    placeholder="Select Level"
                    isClearable
                    isDisabled={loadingLevels}
                    styles={{
                      control: base => ({ ...base, backgroundColor: "transparent" }),
                      singleValue: base => ({ ...base, color: "inherit" }),
                    }}
                  />
                ) : selectedAttraction.level}
              </p>
              <p><strong>Time to Max: </strong> 
                {selectedAttraction.levelsRemaining === 0 ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                        ⭐ Max Level
                      </span>
                    ) : selectedAttraction.levelsRemaining <= 3 ? (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm">
                        ⚡ Almost Max ({selectedAttraction.timeToMax})
                      </span>
                    ) : (
                      selectedAttraction.timeToMax
                    )}
              </p>
              <p><strong>Created At:</strong> {new Date(selectedAttraction.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {!isEditMode && !confirmDelete && (
                <>
                  <button onClick={() => setIsEditMode(true)} className="bg-yellow-500 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                  {/*<button onClick={() => setConfirmDelete(true)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>*/}
                </>
              )}

              {isEditMode && <button onClick={handleSaveLevel} className="bg-green-600 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-green-700" disabled={loading}>Save</button>}

              {confirmDelete && (
                <>
                  <p className="text-red-600 mr-auto">Are you sure?</p>
                  <button onClick={handleDeleteAttraction} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Yes</button>
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