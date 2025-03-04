import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AppartementDetails() {
  // Données brutes de l'appartement

  const navigate = useNavigate();

  const [appartement, setAppartement] = useState({
    id: 1,
    titre: "Chambre - Les Lilas, France",
    localisation: "Les Lilas, France",
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI1ODU4MzI0MzUxNTQ3NTM5MA%3D%3D/original/703bba30-5fc5-463b-a35f-1e2eb65d4911.jpeg?im_w=1200&im_format=avif",
    description: "À 4 minutes à pied du Métro Mairie des Lilas...",
    remarques: "Je suis amatrice de piano...",
    prixParNuit: 43,
    fraisMenage: 10,
    fraisService: 38,
    note: 4.8,
    nombreAvis: 10,
    statut: "Coup de cœur voyageurs",
    hote: "Michelle",
    caractéristiques: [
      { titre: "Chambre dans hébergement", description: "Votre chambre privée...", icone: "🏠" },
      { titre: "Emplacement idéal", description: "Les voyageurs adorent...", icone: "📍" },
      { titre: "Annulation gratuite", description: "Remboursement intégral...", icone: "✅" }
    ]
  });
  const handleReservation = () => {
    navigate("/reservation", {
      state: {
        appartement,
        voyageurs: 2,
        dates: {
          arrivee: "12 avril",
          depart: "17 avril",
        },
      },
    });
  };
  

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
  {/* IMAGE */}
  <img
      src={appartement.image}
      alt={appartement.titre}
      className="w-full h-64 object-cover rounded-lg mb-6"
    />
        <h1 className="text-3xl font-bold mb-2">{appartement.titre}</h1>
        <p className="text-gray-600 mb-4">Note : ⭐ {appartement.note} ({appartement.nombreAvis} avis)</p>

        <h2 className="text-2xl font-semibold mb-3">À propos de ce logement</h2>
        <p className="text-gray-700 mb-6">{appartement.description}</p>

        <h3 className="text-xl font-semibold mb-2">Autres remarques</h3>
        <p className="text-gray-700 mb-6">{appartement.remarques}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appartement.caractéristiques.map((carac, index) => (
            <div key={index} className="flex items-start gap-2">
              <span>{carac.icone}</span>
              <div>
                <p className="font-medium">{carac.titre}</p>
                <p className="text-sm text-gray-600">{carac.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold">Détail du prix :</p>
          <p>{appartement.prixParNuit} € x 5 nuits = {appartement.prixParNuit * 5} €</p>
          <p>Frais de ménage : {appartement.fraisMenage} €</p>
          <p>Frais de service : {appartement.fraisService} €</p>
          <p className="font-bold mt-2">Total : {(appartement.prixParNuit * 5) + appartement.fraisMenage + appartement.fraisService} €</p>
        </div>

        <div className="mt-8">
        <button
  onClick={handleReservation}
  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
>
  Réserver cet appartement
</button>

        </div>

      </div>
    </div>
  );
}
