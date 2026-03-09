"use client";

import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Select from "react-select";

// assign filter options type
interface Option {
  label: string;
}

interface ActivityLogRow {
  
  id: number;
  userId: number | null;
  userIdLabel: string | null;
  action: string;
  tableName: string;
  recordId: number | null;
  beforeData: Record<string, any> | null;
  afterData: Record<string, any> | null;
  ip: string | null;
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
    action: "",
    tableName: "",
    fromDate: "",
    toDate: "",
  });

  const [action_filter, setActionFilter] = useState<Option[]>([]);
  const [tableName_filter, setTableNameFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<ActivityLogRow[]>([]);
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

  const actionOptions: DropdownOption[] = action_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  const tableNameOptions: DropdownOption[] = tableName_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedActivityLog, setSelectedActivityLog] = useState<ActivityLogRow | null>(null);

  // ===============================
  // FETCH ACTIVITY LOG DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("activity_log_actions");
    fetchDropdown("activity_log_tableNames");
    handleFilter();
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/admin/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "activity_log_actions") {
      setActionFilter(data.dropdown);
    }

    if (type === "activity_log_tableNames") {
      setTableNameFilter(data.dropdown);
    }

  };

  // ===============================
  // FETCH ACTION WHEN ACTION CHANGE
  // ===============================
  const handleActionChange = async (value: string) => {
    setFilters({ ...filters, action: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH TABLE NAME WHEN TABLE NAME CHANGE
  // ===============================
  const handleTableNameChange = async (value: string) => {
    setFilters({ ...filters, tableName: value });
  
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


  if (customFilters.action)
    params.action = customFilters.action;

  if (customFilters.tableName)
    params.tableName = customFilters.tableName;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/activity-log/getActivityLogsList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.activitylogs || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: ActivityLogRow) => {
    setSelectedActivityLog(row);
    setViewModalOpen(true);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      action: "",
      tableName: "",
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
          Activity Logs
        </h1>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 text-black dark:text-black-100">

        {/* Action */}
        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={actionOptions}
            value={actionOptions.find((option) => option.value === filters.action) || null}
            onChange={(selected) =>
              handleActionChange(selected ? selected.value : "")
            }
            placeholder="Select Action"
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

          {/* Table Name */}

        <Select<DropdownOption>
            className="text-black dark:text-black-100"
            classNamePrefix="rs"
            options={tableNameOptions}
            value={tableNameOptions.find((option) => option.value === filters.tableName) || null}
            onChange={(selected) =>
              handleTableNameChange(selected ? selected.value : "")
            }
            placeholder="Select Table Name"
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
          {(filters.action ||
            filters.tableName ||
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
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Table Name</th>
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
                  <td className="p-2 border">{row.userIdLabel}</td>
                  <td className="p-2 border text-center">{row.action}</td>
                  <td className="p-2 border text-center">{row.tableName}</td>
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
      {viewModalOpen && selectedActivityLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[700px] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">Activity Log Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p><strong>Email:</strong> {selectedActivityLog.userIdLabel}</p>
              <p><strong>Action:</strong> {selectedActivityLog.action}</p>
              <p><strong>Table Name:</strong> {selectedActivityLog.tableName}</p>
              <p><strong>Record ID:</strong> {selectedActivityLog.recordId}</p>
              <div>
                <strong>Before Data:</strong>
                <pre>{JSON.stringify(selectedActivityLog.beforeData, null, 2)}</pre>
              </div>

              <div>
                <strong>After Data:</strong>
                <pre>{JSON.stringify(selectedActivityLog.afterData, null, 2)}</pre>
              </div>
              <p><strong>IP Address:</strong> {selectedActivityLog.ip || "N/A"}</p>
              <p><strong>Created At:</strong> {selectedActivityLog.createdAt ? new Date(selectedActivityLog.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created By:</strong> {selectedActivityLog.createdByLabel || "N/A"}</p>
              <p><strong>Updated At:</strong> {selectedActivityLog.updatedAt ? new Date(selectedActivityLog.updatedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated By:</strong> {selectedActivityLog.updatedByLabel || "N/A"}</p>
              <p><strong>Deleted At:</strong> {selectedActivityLog.deletedAt ? new Date(selectedActivityLog.deletedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Deleted By:</strong> {selectedActivityLog.deletedByLabel || "N/A"}</p>
            </div>

          </div>
        </div>
      )}

    </div>    
  );
}