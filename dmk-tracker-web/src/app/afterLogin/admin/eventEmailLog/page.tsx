"use client";

import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Select from "react-select";

// assign filter options type
interface Option {
  label: string;
  id: number;
}

interface EventEmailLogRow {
  
  id: number;
  userId: number;
  userIdLabel: string | null;
  sentAt: string | null;
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

export default function OTPLogPage() {
  const [filters, setFilters] = useState({
    userId: "",
    fromDate: "",
    toDate: "",
  });

  const [userId_filter, setUserIdFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<EventEmailLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown option type
  type DropdownOption = {
    value: string;
    label: string;
  };

 
  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEventEmailLog, setSelectedEventEmailLog] = useState<EventEmailLogRow | null>(null);

  // ===============================
  // FETCH EVENT EMAIL LOG DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("useremail");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "useremail") {
      setUserIdFilter(data.dropdown);
    }
  };

  // ===============================
  // FETCH USER ID WHEN USER ID CHANGE
  // ===============================
  const handleUserIdChange = async (value: string) => {
    setFilters({ ...filters, userId: value });
  
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


  if (customFilters.userId)
    params.userId = customFilters.userId;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/event-email-log/getEventEmailLogsList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.eventEmaillogs || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: EventEmailLogRow) => {
    setSelectedEventEmailLog(row);
    setViewModalOpen(true);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      userId: "",
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
          Event Email Logs
        </h1>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 text-black dark:text-black-100">
        {/* Email */}
        <Select
            options={userId_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.userId !== ""
                ? userId_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.userId)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                userId: selected ? String(selected.value) : "",
              })
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
          className="bg-blue-600 text-black dark:text-black-100 rounded p-2 w-full"
        >
          {loading ? "Loading..." : "Filter"}
        </button>

          {/* Reset Button */}
          {(filters.userId ||
            filters.fromDate ||
            filters.toDate) && (
            <button
              onClick={handleResetFilter}
              className="bg-gray-500 rounded p-2 hover:bg-gray-600 transition text-black dark:text-black-100 w-full"
            >
              Reset
            </button>
          )}
      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md text-black dark:text-black-100">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">No.</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Sent At</th>
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
                    <td className="p-2 border text-center">{row.id}</td>
                    <td className="p-2 border">{row.userIdLabel}</td>
                    <td className="p-2 border text-center">
                      {row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "N/A"}
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
                      {row.userIdLabel}
                    </p> 
                    <p className="text-black-600">
                      {row.sentAt ? new Date(row.sentAt).toLocaleDateString() : "N/A"}
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
      {viewModalOpen && selectedEventEmailLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Event Email Log Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p><strong>Email:</strong> {selectedEventEmailLog.userIdLabel}</p>
              <p><strong>Sent At:</strong> {selectedEventEmailLog.sentAt ? new Date(selectedEventEmailLog.sentAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created At:</strong> {selectedEventEmailLog.createdAt ? new Date(selectedEventEmailLog.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created By:</strong> {selectedEventEmailLog.createdByLabel || "N/A"}</p>
              <p><strong>Updated At:</strong> {selectedEventEmailLog.updatedAt ? new Date(selectedEventEmailLog.updatedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated By:</strong> {selectedEventEmailLog.updatedByLabel || "N/A"}</p>
              <p><strong>Deleted At:</strong> {selectedEventEmailLog.deletedAt ? new Date(selectedEventEmailLog.deletedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Deleted By:</strong> {selectedEventEmailLog.deletedByLabel || "N/A"}</p>
            </div>

          </div>
        </div>
      )}

    </div>    
  );
}