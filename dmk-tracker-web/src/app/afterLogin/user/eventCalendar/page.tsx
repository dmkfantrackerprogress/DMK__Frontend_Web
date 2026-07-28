"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface EventCalendar {
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [upcomingEvents, setUpcomingEvents] = useState<EventCalendar[]>([]);

  const [loading, setLoading] = useState(false);

  {/* Modal for single upcoming event details */}

  const [selectedUpcomingEvent, setSelectedUpcomingEvent] =
  useState<EventCalendar | null>(null);

  const [showUpcomingEventModal, setShowUpcomingEventModal] = useState(false);

  {/* Modal for selected date event details */}

  const [selectedEvents, setSelectedEvents] = useState<EventCalendar[]>([]);

  const [showDateEventModal, setShowDateEventModal] = useState(false);


  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchUpcomingEvents();

    fetchEventsByDate(formatDate(new Date()));
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const res = await fetch(
        "/api/user/event-calendar/getUpcomingEventList?page=1&limit=100"
      );

      const data = await res.json();

      setUpcomingEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEventsByDate = async (date: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/user/event-calendar/getEventCalendarByDate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({
            selectedDate: date,
            page: 1,
            limit: 20,
          }),
        }
      );

      const data = await res.json();

      setSelectedEvents(data.events || []);
      setShowDateEventModal(true);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasEvent = (date: Date) => {
    const current = date.toISOString().split("T")[0];

    return upcomingEvents.some(
      (event) =>
        current >= event.start_date &&
        current <= event.end_date
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-black">
      {/* Calendar */}

      <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
        <Calendar
          value={selectedDate}
          onChange={(value) => {
            const date = value as Date;

            setSelectedDate(date);

            fetchEventsByDate(formatDate(date));
          }}
          tileContent={({ date }) =>
            hasEvent(date) ? (
              <div className="flex justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
            ) : null
          }
        />
      </div>

      {/* Selected Date */}

      {showDateEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDateEventModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-bold text-black">
                📅 Events on {formatDate(selectedDate)}
              </h2>

              <button
                onClick={() => setShowDateEventModal(false)}
                className="text-2xl text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[500px] overflow-y-auto p-6">
              {loading ? (
                <p>Loading...</p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-gray-500">
                  No events on this date.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <h3 className="text-lg font-semibold text-black">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-blue-600">
                        {event.start_date} → {event.end_date}
                      </p>

                      <textarea
                        readOnly
                        value={event.description || ""}
                        rows={4}
                        className="mt-3 w-full rounded-lg border bg-gray-50 p-3 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={() => setShowDateEventModal(false)}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

   

      {/* Upcoming */}

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-bold text-lg mb-4 text-black">
          Upcoming Events
        </h2>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                setSelectedUpcomingEvent(event);
                setShowUpcomingEventModal(true);
              }}
              className="cursor-pointer border rounded-lg p-3 transition hover:bg-gray-50 hover:shadow-md"
            >
              <div className="font-semibold text-black">
                {event.title}
              </div>

              <div className="text-sm text-blue-800">
                {event.start_date} ~ {event.end_date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUpcomingEventModal && selectedUpcomingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-bold text-black">
                📅 {selectedUpcomingEvent.title}
              </h2>

              <button
                onClick={() => setShowUpcomingEventModal(false)}
                className="text-2xl text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6">

              <div>
                <p className="font-semibold text-black-700">
                  Start Date
                </p>

                <p className="text-xl text-blue-600">{selectedUpcomingEvent.start_date}</p>
              </div>

              <div>
                <p className="font-semibold text-black-700">
                  End Date
                </p>

                <p className="text-xl text-blue-600">{selectedUpcomingEvent.end_date}</p>
              </div>

              <div>
                <p className="font-semibold text-black-700">
                  Description
                </p>

                <textarea
                  readOnly
                  rows={6}
                  value={selectedUpcomingEvent.description || ""}
                  className="w-full rounded-lg border p-3 bg-gray-50 resize-none"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-4">
              <button
                onClick={() => setShowUpcomingEventModal(false)}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}