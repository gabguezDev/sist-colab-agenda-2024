import React from "react";

const DateUtils = {
  format(date, formatString) {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    switch (formatString) {
      case "MMMM yyyy":
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      case "yyyy-MM-dd":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
      case "d":
        return date.getDate().toString();
      case "dd/MM/yyyy":
        return `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;
      default:
        return date.toString();
    }
  },

  generateMonthDays(currentDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = 1; i < startingDay; i++) {
      const prevDay = new Date(
        prevMonthLastDay.getFullYear(),
        prevMonthLastDay.getMonth(),
        prevMonthLastDay.getDate() - startingDay + i + 1
      );
      days.push(prevDay);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const totalDays = 42;
    while (days.length < totalDays) {
      const nextMonthDay = new Date(
        year,
        month + 1,
        days.length - lastDay.getDate()
      );
      days.push(nextMonthDay);
    }

    return days;
  },
};

const App = () => {
  const [events, setEvents] = React.useState(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    return savedEvents ? JSON.parse(savedEvents) : {};
  });

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedTime, setSelectedTime] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
  const [editingEvent, setEditingEvent] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setSelectedTime("");
    setEventDescription("");
    setEditingEvent(null);
  };

  const saveEvent = () => {
    if (!selectedDate || !selectedTime || !eventDescription) return;

    const newDateKey = DateUtils.format(selectedDate, "yyyy-MM-dd");
    const originalDateKey = editingEvent
      ? editingEvent.originalDate
      : newDateKey;

    const newEvent = {
      id: editingEvent?.id || Date.now(),
      time: selectedTime,
      description: eventDescription,
    };

    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };

      if (editingEvent && originalDateKey !== newDateKey) {
        updatedEvents[originalDateKey] = updatedEvents[originalDateKey]?.filter(
          (event) => event.id !== editingEvent.id
        );

        if (updatedEvents[originalDateKey]?.length === 0) {
          delete updatedEvents[originalDateKey];
        }
      }

      updatedEvents[newDateKey] = [
        ...(updatedEvents[newDateKey] || []).filter(
          (event) => event.id !== editingEvent?.id
        ),
        newEvent,
      ];

      return updatedEvents;
    });

    setSelectedDate(null);
    setSelectedTime("");
    setEventDescription("");
    setEditingEvent(null);
  };

  const deleteEvent = (dateKey, eventId) => {
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };

      updatedEvents[dateKey] = updatedEvents[dateKey]?.filter(
        (event) => event.id !== eventId
      );

      if (updatedEvents[dateKey]?.length === 0) {
        delete updatedEvents[dateKey];
      }

      return updatedEvents;
    });
  };

  const editEvent = (dateKey, event) => {
    const eventDate = new Date(
      dateKey.split("-")[0],
      dateKey.split("-")[1] - 1,
      dateKey.split("-")[2]
    );

    setSelectedDate(eventDate);
    setSelectedTime(event.time);
    setEventDescription(event.description);
    setEditingEvent({
      ...event,
      originalDate: dateKey,
    });
  };

  const renderDayEvents = (day) => {
    const dateKey = DateUtils.format(day, "yyyy-MM-dd");
    return events[dateKey] || [];
  };

  const Calendar = React.useMemo(() => {
    const CalendarComponent = () => {
      const days = DateUtils.generateMonthDays(currentDate);
      const monthName = DateUtils.format(currentDate, "MMMM yyyy");

      return (
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              {"<"}
            </button>
            <h2 className="text-xl font-bold">{monthName}</h2>
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              {">"}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
              <div key={day} className="font-bold text-gray-600">
                {day}
              </div>
            ))}
            {days.map((day) => (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`p-2 border rounded cursor-pointer ${
                  day.getMonth() !== currentDate.getMonth()
                    ? "text-gray-300"
                    : ""
                } ${
                  selectedDate && day.getTime() === selectedDate.getTime()
                    ? "bg-blue-200"
                    : "hover:bg-blue-100"
                }`}
              >
                {DateUtils.format(day, "d")}
                {renderDayEvents(day).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs text-green-600 mt-1 flex justify-between items-center"
                  >
                    <span>
                      {event.time} - {event.description}
                    </span>
                    <div className="flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editEvent(DateUtils.format(day, "yyyy-MM-dd"), event);
                        }}
                        className="text-blue-500 text-xs ml-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(
                            DateUtils.format(day, "yyyy-MM-dd"),
                            event.id
                          );
                        }}
                        className="text-red-500 text-xs ml-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return <CalendarComponent />;
  }, [currentDate, selectedDate, events]);

  const EventModal = React.useMemo(() => {
    if (!selectedDate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          <h2 className="text-xl font-bold mb-4">
            {editingEvent ? "Editar Evento" : "Nuevo Evento"} -{" "}
            {DateUtils.format(selectedDate, "dd/MM/yyyy")}
          </h2>
          <div className="mb-4">
            <label className="block mb-2">Hora</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Descripción</label>
            <input
              type="text"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={saveEvent}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {editingEvent ? "Actualizar" : "Guardar"}
            </button>
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedTime("");
                setEventDescription("");
                setEditingEvent(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }, [selectedDate, selectedTime, eventDescription, editingEvent]);

  return (
    <div className="p-4">
      <h1 style={{ textAlign: "center", fontSize: 30 }}>Agenda personal</h1>
      {Calendar}
      {EventModal}
    </div>
  );
};

export default App;
