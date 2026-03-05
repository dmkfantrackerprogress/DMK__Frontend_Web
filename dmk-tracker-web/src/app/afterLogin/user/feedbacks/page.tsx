"use client";

import { useEffect, useState } from "react";

type FeedbackType = {
  id: number;
  label: string;
};

export default function FeedbackPage() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);

  const [createData, setCreateData] = useState({
    type: 0,
    content: "",
  });

  // fetch enum list
  useEffect(() => {
    fetchDropdown("feedback_types");
  }, []);

  const fetchDropdown = async (type: string, extra?: any) => {
    const res = await fetch("/api/user/dropdown", {
      method: "POST",
      body: JSON.stringify({ type, ...extra }),
    });

    const data = await res.json();

    if (type === "feedback_types") {
      setFeedbackTypes(data.dropdown);

    }

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try{
        const res = await fetch("/api/user/feedback/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
    });

      const data = await res.json();

        if (!res.ok) {
            setError(data.message);
            return;
        }


      setMessage(data.message);
      setCreateData({
        type: Number(feedbackTypes[0]?.id) || 0,
        content: "",
      });

      setCreateData({
        type: Number(feedbackTypes[0]?.id) || 0,
        content: "",
      });
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }  

    setTimeout(() => {
        setMessage("");
        setError("");
    }, 1500);
    
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.8)] rounded text-black dark:text-black-100">
      <h1 className="text-xl font-bold mb-4">Submit Feedback</h1>

      {message && (
        <div className="bg-green-100 text-green-700 p-2 mb-3 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block mb-1 font-medium">Feedback Type</label>
          <select
            value={createData.type}
            onChange={(e) => setCreateData({...createData, type: Number(e.target.value)})}
            className="border p-2 w-full rounded"
            required
          >

            {feedbackTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <textarea
            value={createData.content}
            onChange={(e) => setCreateData({...createData, content: e.target.value})}
            minLength={10}
            maxLength={1000}
            required
            rows={5}
            className="border p-2 w-full rounded"
          />

          <div className="text-xs text-right text-gray-500">
            {createData.content.length}/1000
          </div>
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}