import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Reservation() {
  const { state } = useLocation();
  const { appartement, dates, voyageurs } = state || {};
  const navigate = useNavigate();

  if (!appartement) {
    return <div>Erreur : aucune donnée d'appartement reçue.</div>;
  }

  const nuits = 5; // Tu peux le rendre dynamique plus tard
  const total =
    appartement.prixParNuit * nuits +
    appartement.fraisMenage +
    appartement.fraisService;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Demande de réservation</h1>

        {/* Partie infos */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-4">Votre voyage</h2>
              <p>Dates : {dates.arrivee} - {dates.depart}</p>
              <p>Voyageurs : {voyageurs}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-4">Choisissez comment vous souhaitez payer</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="radio" name="paiement" defaultChecked />
                  <span className="ml-2">Payer {total.toFixed(2)} € maintenant</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="paiement" />
                  <span className="ml-2">Payer en plusieurs fois (non disponible)</span>
                </label>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
              Confirmer la réservation
            </button>
          </div>

          {/* Résumé */}
          <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow">
            <img
              src={appartement.image}
              alt={appartement.titre}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold text-lg">{appartement.titre}</h3>
            <p className="text-sm text-gray-600">
              {appartement.statut} • ⭐ {appartement.note} ({appartement.nombreAvis} avis)
            </p>

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{appartement.prixParNuit} € x {nuits} nuits</span>
                <span>{(appartement.prixParNuit * nuits).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de ménage</span>
                <span>{appartement.fraisMenage} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de service</span>
                <span>{appartement.fraisService} €</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
  <h2 className="font-semibold text-lg mb-4">Connectez-vous ou inscrivez-vous pour réserver</h2>

  <div>
    <label className="block text-sm font-medium mb-1">Pays/Région</label>
    <select className="w-full p-3 border rounded-lg">
      <option>France (+33)</option>
      <option>Belgique (+32)</option>
      <option>Suisse (+41)</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
    <input
      type="tel"
      placeholder="06 12 34 56 78"
      className="w-full p-3 border rounded-lg"
    />
  </div>

  <button className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition">
    Continuer
  </button>

  <div className="flex items-center justify-center my-4">
    <span className="border-b flex-1"></span>
    <span className="px-3 text-sm text-gray-500">ou</span>
    <span className="border-b flex-1"></span>
  </div>

  <div className="flex justify-center gap-4">
    <button className="p-3 border rounded-full hover:bg-gray-100">
      <i className="fab fa-facebook-f"></i>
    </button>
    <button className="p-3 border rounded-full hover:bg-gray-100">
      <i className="fab fa-google"></i>
    </button>
    <button className="p-3 border rounded-full hover:bg-gray-100">
      <i className="fab fa-apple"></i>
    </button>
  </div>

  <p className="text-center text-sm mt-4">
    <a href="/login" className="text-blue-600 hover:underline">
      Continuer avec une adresse e-mail
    </a>
  </p>
</div>
      </div>
    </div>
  );
}
