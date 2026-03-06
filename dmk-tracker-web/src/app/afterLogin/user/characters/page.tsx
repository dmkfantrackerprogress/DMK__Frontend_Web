"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

interface Option {
  id: number;
  label: string;
  level?: number;
}

interface CharacterRow {
  id: number;
  collectionLabel: string;
  characterLabel: string;
  characterId: number;
  collectionId: number;
  level: number;
  createdAt: string;
  maxLevel: number;
  levelsRemaining: number;
  timeToMax: string;
}

export default function UserCharacterPage() {
  const [filters, setFilters] = useState({
    collectionId: "",
    characterId: "",
    level: "",
    fromDate: "",
    toDate: "",
  });

  const [collections_registered, setCollectionsRegistered] = useState<Option[]>([]);
  const [characters_registered, setCharactersRegistered] = useState<Option[]>([]);
  const [levels_registered, setLevelsRegistered] = useState<Option[]>([]);
  const [collections_characters, setCollectionsCharacters] = useState<Option[]>([]);
  const [characters, setCharacters] = useState<Option[]>([]);
  const [levels, setLevels] = useState<Option[]>([]);
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
    collectionId: "",
    characterId: "",
    level: "",
  });

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editLevels, setEditLevels] = useState<Option[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(false);

  // ===============================
  // FETCH COLLECTION DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("collections_characters_registered");
    fetchDropdown("characters_registered");
    fetchDropdown("character_levels_registered");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/user/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "collections_characters_registered") {
      setCollectionsRegistered(data.dropdown);
    }

    if (type === "characters_registered") {
      setCharactersRegistered(data.dropdown);
    }

    if (type === "character_levels_registered") {
      setLevelsRegistered(data.dropdown);
    }

    if (type === "collections_characters") {
      setCollectionsCharacters(data.dropdown);
    }

    if (type === "characters") {
      setCharacters(data.dropdown);
    }

    if (type === "character_levels") {
      setLevels(data.dropdown);
    }
  };

  // ===============================
  // FETCH CHARACTER WHEN COLLECTION CHANGE
  // ===============================
  const handleCollectionChange = async (value: string) => {
    setFilters({ ...filters, collectionId: value, characterId: "", level: "" });
    setCharactersRegistered([]);
    setLevelsRegistered([]);

    if (!value) return;

    await fetchDropdown("characters_registered", {
      collectionId: Number(value),
    });

    await fetchDropdown("character_levels_registered", {
      characterId: Number(value),
    });
  };

  // ===============================
  // FETCH LEVEL WHEN CHARACTER CHANGE
  // ===============================
  const handleCharacterChange = async (value: string) => {
    setFilters({ ...filters, characterId: value, level: "" });
    setLevelsRegistered([]);

    if (!value) return;

    await fetchDropdown("character_levels_registered", {
      characterId: Number(value),
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

  if (customFilters.characterId)
    params.characterId = customFilters.characterId;

  if (customFilters.level)
    params.level = customFilters.level;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/user/characters/getCharacterList?${query.toString()}`
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

  if (!createData.collectionId || !createData.characterId || !createData.level) {
    setError("Please select all fields.");
    return;
  }

  const res = await fetch("/api/user/characters/create", {
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
    characterId: "",
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

  // reset form
  setCreateData({
    collectionId: "",
    characterId: "",
    level: "",
  });

  setCharacters([]);
  setLevels([]);

  await fetchDropdown("collections_characters");
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: CharacterRow) => {
    setSelectedCharacter(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);

    // Fetch levels for dropdown
    setLoadingLevels(true);
    const res = await fetch("/api/user/dropdown", {
      method: "POST",
      body: JSON.stringify({ type: "character_levels", characterId: row.characterId }),
    });
    const data = await res.json();
    setEditLevels(data.dropdown || []);
    setLoadingLevels(false);
  };

  const handleSaveLevel = async () => {
    if (!selectedCharacter) return;

    await fetch("/api/user/characters/update", {
      method: "POST",
      body: JSON.stringify({ id: selectedCharacter.id, level: selectedCharacter.level, characterId: selectedCharacter.characterId }),
    });

    setRows(rows.map((r) => (r.id === selectedCharacter.id ? selectedCharacter : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return;

    await fetch("/api/user/characters/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedCharacter.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedCharacter.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      collectionId: "",
      characterId: "",
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
            options={characters_registered.map((c) => ({
              value: c.id,
              label: c.label,
            }))}
            value={
              characters_registered
                .map((c) => ({ value: c.id, label: c.label }))
                .find((option) => option.value === Number(filters.characterId)) || null
            }
            onChange={(selected) =>
              handleCharacterChange(selected ? String(selected.value) : "")
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

        {/* Level */}
        <Select
            options={levels_registered.map((l) => ({
              value: l.level,
              label: l.label,
            }))}
            value={
              levels_registered
                .map((l) => ({
                  value: l.level,
                  label: l.label,
                }))
                .find((option) => option.value === Number(filters.level)) || null
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
            filters.characterId ||
            filters.level ||
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

      {/* ================= CREATE CHARACTER MODAL ================= */}
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

              {/* Collection */}
              <Select
                options={collections_characters.map((c) => ({
                  value: c.id,
                  label: c.label,
                }))}
                value={
                  collections_characters
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
                    characterId: "",
                    level: "",
                  });

                  setLevels([]);
                  setCharacters([]);

                  if (!value) return;

                  await fetchDropdown("characters", {
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

              {/* Character */}
              <Select
                options={characters.map((c) => ({
                  value: c.id,
                  label: c.label,
                }))}
                value={
                  characters
                    .map((c) => ({
                      value: c.id,
                      label: c.label,
                    }))
                    .find(
                      (option) =>
                        option.value === Number(createData.characterId)
                    ) || null
                }
                onChange={async (selected) => {
                  const value = selected ? selected.value : "";

                  setCreateData({
                    ...createData,
                    characterId: value ? String(value) : "",
                    level: "",
                  });

                  setLevels([]);

                  if (!value) return;

                  await fetchDropdown("character_levels", {
                    characterId: Number(value),
                  });
                }}
                placeholder="Select Character"
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
                    isDisabled={!createData.characterId}
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
              <th className="p-2 border">Character</th>
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
                  <td className="p-2 border">{row.characterLabel}</td>
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
      {viewModalOpen && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Character Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p><strong>Collection:</strong> {selectedCharacter.collectionLabel}</p>
              <p><strong>Character:</strong> {selectedCharacter.characterLabel}</p>
              <p>
                <strong>Level:</strong>{" "}
                {isEditMode ? (
                  <Select
                    options={editLevels.map(l => ({ value: l.level, label: l.label }))}
                    value={editLevels.map(l => ({ value: l.level, label: l.label }))
                      .find(o => o.value === selectedCharacter.level) || null}
                    onChange={selected => selectedCharacter && setSelectedCharacter({ ...selectedCharacter, level: selected?.value || selectedCharacter.level })}
                    placeholder="Select Level"
                    isClearable
                    isDisabled={loadingLevels}
                    styles={{
                      control: base => ({ ...base, backgroundColor: "transparent" }),
                      singleValue: base => ({ ...base, color: "inherit" }),
                    }}
                  />
                ) : selectedCharacter.level}
              </p>
              <p><strong>Time to Max: </strong> 
                {selectedCharacter.levelsRemaining === 0 ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                        ⭐ Max Level
                      </span>
                    ) : selectedCharacter.levelsRemaining <= 3 ? (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm">
                        ⚡ Almost Max ({selectedCharacter.timeToMax})
                      </span>
                    ) : (
                      selectedCharacter.timeToMax
                    )}
              </p>
              <p><strong>Created At:</strong> {new Date(selectedCharacter.createdAt).toLocaleDateString()}</p>
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
                  <button onClick={handleDeleteCharacter} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Yes</button>
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