import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Calendrier = ({ appartementId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/disponibilites/${appartementId}`)
      .then((res) => res.json())
      .then((data) => {
        const datesDisponibles = data.map((d) => new Date(d.date));
        setDisponibilites(datesDisponibles);
      })
      .catch((err) => console.error("Erreur chargement des dispos", err));
  }, [appartementId]);

  const isDateAvailable = (date) => {
    return disponibilites.some((d) => d.getTime() === date.getTime());
  };

  return (
    <div>
      <h3>Calendrier des disponibilités</h3>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => (isDateAvailable(date) ? "dispo" : "non-dispo")}
      />
      <style>{`
        .dispo {
          background-color: lightgreen !important;
        }
        .non-dispo {
          background-color: lightcoral !important;
        }
      `}</style>
    </div>
  );
};

export default Calendrier;
