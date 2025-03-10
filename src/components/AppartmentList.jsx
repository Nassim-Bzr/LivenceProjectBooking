import { useEffect, useState } from "react";
import { fetchAppartements, fetchDisponibilites } from "../Api.js/apiSmoobu";

export default function AppartementList() {
  const [appartements, setAppartements] = useState([]);
  const [disponibilites, setDisponibilites] = useState({});

  useEffect(() => {
    async function getData() {
      const data = await fetchAppartements();
      console.log("Appartements récupérés :", data); // Vérification dans la console
      setAppartements(data);

      // Récupérer les disponibilités pour chaque appartement
      const dispoData = {};
      for (let appartement of data) {
        dispoData[appartement.id] = await fetchDisponibilites(appartement.id);
      }
      setDisponibilites(dispoData);
    }

    getData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-6">Nos Appartements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appartements.map((app) => (
          <div key={app.id} className="border rounded-lg shadow-lg p-4">
            <img src={app.imageUrl} alt={app.name} className="w-full h-48 object-cover rounded-md" />
            <h2 className="text-xl font-semibold mt-4">{app.name}</h2>
            <p className="text-gray-500">{app.location}</p>
            <p className="text-gray-700 mt-2">Prix : <span className="font-semibold">{app.pricePerNight}€ / nuit</span></p>

            <div className="mt-4">
              <h3 className="text-lg font-semibold">Disponibilités :</h3>
              {disponibilites[app.id] ? (
                <ul className="text-sm text-gray-600 mt-2">
                  {disponibilites[app.id].length > 0 ? (
                    disponibilites[app.id].map((date, index) => (
                      <li key={index}>✅ Disponible : {date}</li>
                    ))
                  ) : (
                    <li className="text-red-500">❌ Pas de disponibilité</li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">Chargement...</p>
              )}
            </div>

            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Réserver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
