import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appartements } from "../Api.js/api";

export default function AppartementDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appartement = appartements.find((apt) => apt.id === parseInt(id));

  console.log(appartement);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [voyageurs, setVoyageurs] = useState(2);

  if (!appartement) {
    return <div className="text-center py-20">Appartement non trouvé.</div>;
  }

  const totalPrix =
    appartement.prixParNuit * 5 + appartement.fraisMenage + appartement.fraisService;

  const handleReservation = () => {
    if (!dateArrivee || !dateDepart) {
      alert("Veuillez sélectionner vos dates de séjour");
      return;
    }
    navigate("/reservation", {
      state: {
        appartement,
        voyageurs,
        dates: {
          arrivee: dateArrivee,
          depart: dateDepart,
        },
      },
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        
        {/* IMAGE PRINCIPALE */}
        <img
  src={appartement.images[0]}
  alt={appartement.titre}
  onClick={() => setShowGallery(true)}
  className="w-full h-64 object-cover rounded-lg mb-6 cursor-pointer"
/>
{showGallery && (
  <div
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto"
    onClick={() => setShowGallery(false)} // 🔹 Clique sur le fond = ferme la galerie
  >
    {/* Contenu de la galerie */}
    <div
      className="relative w-full max-w-5xl bg-white rounded-xl p-6 space-y-4"
      onClick={(e) => e.stopPropagation()} // 🔹 Empêche de fermer quand on clique à l'intérieur
    >
      
      {/* Bouton de fermeture */}
      <button
        onClick={() => setShowGallery(false)}
        className="absolute top-4 right-4 text-gray-700 hover:text-red-600 text-3xl"
      >
        ✖
      </button>

      <h2 className="text-center text-xl font-semibold mb-4">
        Galerie de photos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {appartement.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Image ${index + 1}`}
            onClick={() => setSelectedImage(img)}
            className="w-full h-64 object-cover rounded-lg cursor-pointer transition-transform transform hover:scale-105 duration-300"
          />
        ))}
      </div>
    </div>
  </div>
)}


{selectedImage && (
  <div
    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={() => setSelectedImage(null)} // Ferme quand on clique le fond
  >
    <button
      onClick={() => setSelectedImage(null)}
      className="absolute top-6 right-6 text-white hover:text-red-500 text-4xl"
    >
      ✖
    </button>

    {/* Stop propagation pour éviter que le clic sur l'image ferme la modale */}
    <img
      src={selectedImage}
      alt="Aperçu"
      onClick={(e) => e.stopPropagation()} // ⬅️ Empêche le clic sur l'image de fermer
      className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl transition-transform transform scale-100 hover:scale-105 duration-500"
    />
  </div>
)}




        <h1 className="text-3xl font-bold mb-2">{appartement.titre}</h1>
        <p className="text-gray-600 mb-4">
          {appartement.localisation} • ⭐ {appartement.note} ({appartement.nombreAvis} avis)
        </p>

        {/* DESCRIPTION */}
        <h2 className="text-2xl font-semibold mb-3">À propos du logement</h2>
        <p className="text-gray-700 mb-6">{appartement.description}</p>

        {/* CAPACITÉ */}
        <h3 className="text-xl font-semibold mb-2">Capacité</h3>
        <ul className="text-gray-700 mb-6">
          <li>👥 {appartement.capacite.voyageurs} voyageurs</li>
          <li>🛏️ {appartement.capacite.chambres} chambres</li>
          <li>🛌 {appartement.capacite.lits} lits</li>
          <li>🛁 {appartement.capacite.sallesDeBain} salle(s) de bain</li>
        </ul>

        {/* EQUIPEMENTS */}
        <h3 className="text-xl font-semibold mb-2">Équipements</h3>
        <h3 className="text-xl font-semibold mb-2">Équipements</h3>

{appartement.equipements ? (
  Object.entries(appartement.equipements).map(([categorie, items], index) => (
    <div key={index} className="mb-4">
      <h4 className="font-medium text-gray-800">{categorie}</h4>
      <ul className="ml-4 list-disc text-gray-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  ))
) : (
  <p className="text-gray-500">Aucun équipement renseigné pour ce logement.</p>
)}


        {/* FORMULAIRE DATES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-300 rounded-xl p-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date d'arrivée</label>
            <input
              type="date"
              value={dateArrivee}
              onChange={(e) => setDateArrivee(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date de départ</label>
            <input
              type="date"
              value={dateDepart}
              onChange={(e) => setDateDepart(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
        </div>

        {/* PRIX DÉTAILLÉ */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Détail du prix :</h4>
          <div className="flex justify-between">
            <span>{appartement.prixParNuit} € x 5 nuits</span>
            <span>{appartement.prixParNuit * 5} €</span>
          </div>
          <div className="flex justify-between">
            <span>Frais de ménage</span>
            <span>{appartement.fraisMenage} €</span>
          </div>
          <div className="flex justify-between">
            <span>Frais de service</span>
            <span>{appartement.fraisService} €</span>
          </div>
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{totalPrix} €</span>
          </div>
        </div>

        {/* BOUTON RÉSERVER */}
        <button
          onClick={handleReservation}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Réserver cet appartement
        </button>
      </div>
    </div>
  );
}
