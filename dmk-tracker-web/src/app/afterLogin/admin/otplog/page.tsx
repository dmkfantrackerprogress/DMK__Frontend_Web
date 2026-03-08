"use client";

import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Select from "react-select";

interface Option {
  id: number;
  label: string;
}

interface OTPLogRow {
  
  id: number;
  otp: number;
  email: string;
  action: number;
  actionLabel: string;
  status: number;
  statusLabel: string;
  userId: number;
  userIdLabel: string;
  expiredAt: string | null;
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
    email: "",
    action: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [email_filter, setEmailFilter] = useState<Option[]>([]);
  const [action_filter, setActionFilter] = useState<Option[]>([]);
  const [status_filter, setStatusFilter] = useState<Option[]>([]);
  const [rows, setRows] = useState<OTPLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  type EmailOption = {
  value: string;
  label: string;
  };

  const emailOptions: EmailOption[] = email_filter.map((c) => ({
    value: c.label,
    label: c.label,
  }));

  // ========== VIEW/EDIT MODAL STATES ==========
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedOTPLog, setSelectedOTPLog] = useState<OTPLogRow | null>(null);

  // ===============================
  // FETCH OTPLOG DROPDOWN
  // ===============================
  useEffect(() => {
    fetchDropdown("useremail");
    fetchDropdown("otp_actions");
    fetchDropdown("otp_statuses");
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

    if (type === "otp_actions") {
      setActionFilter(data.dropdown);
    }

    if (type === "otp_statuses") {
      setStatusFilter(data.dropdown);
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
  // FETCH ACTION WHEN ACTION CHANGE
  // ===============================
  const handleActionChange = async (value: string) => {
    setFilters({ ...filters, action: value });
  
    if (!value) return;

  };

  // ===============================
  // FETCH STATUS WHEN STATUS CHANGE
  // ===============================
  const handleStatusChange = async (value: string) => {
    setFilters({ ...filters, status: value });
  
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

  if (customFilters.action)
    params.action = customFilters.action;

  if (customFilters.status)
    params.status = customFilters.status;

  if (customFilters.fromDate)
    params.fromDate = customFilters.fromDate;

  if (customFilters.toDate)
    params.toDate = customFilters.toDate;

  const query = new URLSearchParams(params);

  const res = await fetch(
    `/api/admin/otp-logs/getOtpLogsList?${query.toString()}`
  );

  const data = await res.json();

  setRows(data.otplogs || []);

  // pagination
  setPage(data.meta?.page || 1);
  setTotalPages(data.meta?.totalPages || 1);
  setTotal(data.meta?.total || 0);

  setLoading(false);
};

// ===============================
  // VIEW MODAL LOGIC
  // ===============================
  const openViewModal = async (row: OTPLogRow) => {
    setSelectedOTPLog(row);
    setViewModalOpen(true);
  };

  const handleResetFilter = async () => {
    // Reset filter state
    
    const emptyFilters = {
      email: "",
      action: "",
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
          OTP Logs
        </h1>
      </div>
      {/* ================= FILTER SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 text-black dark:text-black-100">

        {/* Email */}
        <Select<EmailOption>
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

        {/* Action */}

        <Select
            options={action_filter.map((l) => ({
              value: l.id,
              label: l.label,
            }))}
            value={
              filters.action !== ""
                ? action_filter
                    .map((l) => ({
                      value: l.id,
                      label: l.label,
                    }))
                    .find((option) => option.value === Number(filters.action)) || null
                : null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                action: selected ? String(selected.value) : "",
              })
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

          {/* Status */}

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
          {(filters.email ||
            filters.action ||
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

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-4 rounded-xl shadow-md text-black dark:text-black-100">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">OTP</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Status</th>
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
                  <td className="p-2 border">{row.otp}</td>
                  <td className="p-2 border">{row.email}</td>
                  <td className="p-2 border text-center">{row.actionLabel}</td>
                  <td className="p-2 border text-center">{row.statusLabel}</td>
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
      {viewModalOpen && selectedOTPLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black dark:text-black-100">
          <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg relative">

            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-3 text-gray-500">✕</button>

            <h2 className="text-lg font-bold mb-4">OTP Log Info</h2>

            <div className="space-y-2 text-black dark:text-black-100">
              <p><strong>OTP:</strong> {selectedOTPLog.otp}</p>
              <p><strong>Email:</strong> {selectedOTPLog.email}</p> 
              <p><strong>Action:</strong> {selectedOTPLog.actionLabel}</p>
              <p><strong>Status:</strong> {selectedOTPLog.statusLabel}</p>
              <p><strong>User:</strong> {selectedOTPLog.userIdLabel}</p>
              <p><strong>Expired At:</strong> {selectedOTPLog.expiredAt ? new Date(selectedOTPLog.expiredAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created At:</strong> {selectedOTPLog.createdAt ? new Date(selectedOTPLog.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Created By:</strong> {selectedOTPLog.createdByLabel || "N/A"}</p>
              <p><strong>Updated At:</strong> {selectedOTPLog.updatedAt ? new Date(selectedOTPLog.updatedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Updated By:</strong> {selectedOTPLog.updatedByLabel || "N/A"}</p>
              <p><strong>Deleted At:</strong> {selectedOTPLog.deletedAt ? new Date(selectedOTPLog.deletedAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Deleted By:</strong> {selectedOTPLog.deletedByLabel || "N/A"}</p>
            </div>

          </div>
        </div>
      )}

    </div>    
  );
}