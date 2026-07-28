"use client";

import { title } from "process";
import { useEffect, useState } from "react";
import { FaPlus, FaEye } from "react-icons/fa";
import Select from "react-select";

// assign dropdown options data type
interface Option {
  id: number;
  label: string;
}

// table listing data type
interface EventCalendarRow {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
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

export default function EventCalendarPage() {
  const [filters, setFilters] = useState({
    title: "",
    start_date: "",
    end_date: "",
  });

  const [title_filter, setTitleFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<EventCalendarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    start_date: today,
    end_date: today,
  });

  // Dropdown option when pass string value for filters
  type DropdownOption = {
    value: string;
    label: string;
  };

  const titleOptions: DropdownOption[] = title_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEventCalendar, setSelectedEventCalendar] = useState<EventCalendarRow | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

  // ===============================
  // FETCH TITLE DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("event_title");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "event_title") {
      setTitleFilter(data.dropdown);
    }

  };

  // ===============================
  // FETCH TITLE WHEN TITLE CHANGE
  // ===============================
  const handleTitleChange = async (value: string) => {
    setFilters({ ...filters, title: value });
  
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

  if (customFilters.title)
    params.title = customFilters.title;

  if (customFilters.start_date)
    params.start_date = customFilters.start_date;

  if (customFilters.end_date)
    params.end_date = customFilters.end_date;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/event-calendar/getEventCalendarList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.events || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

  // create event
  const handleCreate = async () => {
  setMessage("");
  setError("");
  setSuccess(false);
  setLoading(true);

  if (!createData.title || !createData.description || !createData.start_date || !createData.end_date) {
    setError("Please fill all fields.");
    setLoading(false);
    return;
  }

  const res = await fetch("/api/admin/event-calendar/create", {
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

  const today = new Date().toISOString().split("T")[0];

  setCreateData({
    title: "",
    description: "",
    start_date: today,
    end_date: today,
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
  const today = new Date().toISOString().split("T")[0];

  setCreateData({
    title: "",
    description: "",
    start_date: today,
    end_date: today,
  });
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: EventCalendarRow) => {
    setSelectedEventCalendar(row);
    setViewModalOpen(true);
    setIsEditMode(false);
    setConfirmDelete(false);
    setMessage("");
    setError("");
    
  };

  const handleEdit = () => {
    if (!selectedEventCalendar) return;
    setCreateData({
      title: selectedEventCalendar.title || "",
      description: selectedEventCalendar.description || "",
      start_date: selectedEventCalendar.start_date || "",
      end_date: selectedEventCalendar.end_date || "",
    });

    setIsEditMode(true);
};

  const handleSave = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    if (!selectedEventCalendar) return;

    const updated = {
        ...selectedEventCalendar,
        title: createData.title || selectedEventCalendar.title,
        description: createData.description || selectedEventCalendar.description,
        start_date: createData.start_date || selectedEventCalendar.start_date,
        end_date: createData.end_date || selectedEventCalendar.end_date,
    };

   const res = await fetch("/api/admin/event-calendar/update", {
      method: "POST",
      body: JSON.stringify({ id: updated.id, title: updated.title, description: updated.description, start_date: updated.start_date, end_date: updated.end_date}),
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
    }

    setMessage(data.message);

    setRows(rows.map((r) => (r.id === selectedEventCalendar.id ? updated : r)));
    setIsEditMode(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!selectedEventCalendar) return;

    await fetch("/api/admin/event-calendar/delete", {
      method: "POST",
      body: JSON.stringify({ id: selectedEventCalendar.id }),
    });

    setRows(rows.filter((r) => r.id !== selectedEventCalendar.id));
    setViewModalOpen(false);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
    };

    setFilters(emptyFilters);

    await handleFilter(1, emptyFilters);

  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">
          Event 
        </h1>

        <button
          onClick={handleOpenCreateModal}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
        >
          <FaPlus />
        </button>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 text-black dark:text-black-100">

        {/* Title */}
        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={titleOptions}
            value={titleOptions.find((option) => option.value === filters.title) || null}
            onChange={(selected) =>
              handleTitleChange(selected ? selected.value : "")
            }
            placeholder="Select Title"
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

        {/* Start Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.start_date}
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />

        {/* End Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.end_date}
          onChange={(e) =>
            setFilters({ ...filters, end_date: e.target.value })
          }
        />

        {/* Filter Button */}
        <button
          onClick={() => handleFilter(1)}
          className="bg-blue-600 text-black dark:text-black-100 rounded p-2 w-full"
        >
          {loading ? "Loading..." : "Filter"}
        </button>

          {/* Reset Button */}
          {(filters.title ||
            filters.start_date ||
            filters.end_date) && (
            <button
              onClick={handleResetFilter}
              className="bg-gray-500 rounded p-2 hover:bg-gray-600 transition text-black dark:text-black-100 w-full"
            >
              Reset
            </button>
          )}
      </div>

      {/* ================= CREATE EVENT MODAL ================= */}
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

            <h2 className="text-lg font-bold mb-4">Create Event</h2>

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

              {/* Start Date */}
              <p>
                <strong className="text-black dark:text-black-100">Start Date:</strong>
                <input
                  type="date"
                  value={createData.start_date}
                  min={today}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </p>

              {/* End Date */}
              <p>
                <strong className="text-black dark:text-black-100">End Date:</strong>
                <input
                  type="date"
                  value={createData.end_date}
                  min={createData.start_date || today}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </p>

              {/* Title */}
              <p>
                <strong className="text-black dark:text-black-100">Event Title:</strong>
                <input
                    type="text"
                    placeholder="Event Title"
                    required
                    className="w-full border p-2 rounded text-black dark:text-black-100"
                    value={createData.title}
                    onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                    disabled={loading}
                    autoComplete="off"
                />
              </p>
              
              {/* Description */}
              <p>
                <strong className="text-black dark:text-black-100">Description:</strong>
                <textarea
                  value={createData.description}
                  onChange={(e) => setCreateData({...createData, description: e.target.value})}
                  minLength={10}
                  required
                  rows={5}
                  className="border p-2 w-full rounded overflow-y-auto"
                />

                <div className="text-xs text-right text-gray-500">
                  {createData.description.length}
                </div>
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
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Start Date</th>
                <th className="p-2 border">End Date</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-2 border">{row.title}</td>
                    <td className="p-2 border">{row.start_date}</td>
                    <td className="p-2 border">{row.end_date}</td>
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-center p-4">No data found</div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {row.title}
                    </p>
                    <p className="text-black-600">
                      Start Date: {row.start_date}
                    </p>
                    <p className="text-black-600">
                      End Date: {row.end_date}
                    </p>                                  
                  </div>
                </div>

                <button
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  onClick={() => openViewModal(row)}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
          <div className="text-sm text-gray-600">
            Total: {total}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => handleFilter(page - 1)}
              className="px-4 py-2 border rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-3 py-2 text-sm">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => handleFilter(page + 1)}
              className="px-4 py-2 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

            {/* ================= VIEW / EDIT MODAL ================= */}
      {viewModalOpen && selectedEventCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Event</h2>

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
                  <strong>Event Title:</strong> {" "}
                  {isEditMode ? (
                      <input
                      type="text"
                      placeholder="Event Title"
                      className="w-full border p-2 rounded text-black dark:text-black-100"
                      value={createData.title || selectedEventCalendar.title}
                      onChange={(e) =>
                          setCreateData({ ...createData, title: e.target.value })
                      }
                      disabled={loading}
                      autoComplete="off"
                      />
                  ) : (
                      selectedEventCalendar.title
                  )}
                </p>
                <p>
                  <strong>Description:</strong> 
                  {isEditMode ? (
                      <textarea
                        value={createData.description || selectedEventCalendar.description}
                        onChange={(e) => setCreateData({...createData, description: e.target.value})}
                        minLength={10}
                        rows={3}
                        className="border p-2 w-full rounded overflow-y-auto"
                        disabled={loading}
                        autoComplete="off"
                      />
                  ) : (
                      <textarea
                        value={selectedEventCalendar.description || ""}
                        readOnly
                        rows={5}
                        className="border p-2 w-full rounded overflow-y-auto bg-gray-100"
                        disabled
                      />
                  )}
                </p>
                <p>
                  <strong>Start Date:</strong> 
                  {isEditMode ? (
                      <input
                        type="date"
                        value={createData.start_date}
                        min={today}
                        onChange={(e) =>
                          setCreateData((prev) => ({
                            ...prev,
                            start_date: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                  ) : (
                       selectedEventCalendar.start_date 
                  )}
                </p>
                <p>
                  <strong>End Date:</strong> 

                  {isEditMode ? (
                      <input
                        type="date"
                        value={createData.end_date}
                        min={createData.start_date || today}
                        onChange={(e) =>
                          setCreateData((prev) => ({
                            ...prev,
                            end_date: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                  ) : (
                       selectedEventCalendar.end_date 
                  )}
                </p>
                <p><strong>Created At:</strong> {selectedEventCalendar.createdAt ? new Date(selectedEventCalendar.createdAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Created By:</strong> {selectedEventCalendar.createdByLabel || "N/A"}</p>
                <p><strong>Updated At:</strong> {selectedEventCalendar.updatedAt ? new Date(selectedEventCalendar.updatedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Updated By:</strong> {selectedEventCalendar.updatedByLabel || "N/A"}</p>
                <p><strong>Deleted At:</strong> {selectedEventCalendar.deletedAt ? new Date(selectedEventCalendar.deletedAt).toLocaleDateString() : "N/A"}</p>
                <p><strong>Deleted By:</strong> {selectedEventCalendar.deletedByLabel || "N/A"}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {!isEditMode && !confirmDelete && (
                <>
                  <button onClick={handleEdit} className="bg-yellow-500 text-black dark:text-black-100 px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
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