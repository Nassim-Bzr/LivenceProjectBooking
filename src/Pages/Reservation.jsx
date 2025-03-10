import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function Reservation() {
  const { state } = useLocation();
  const { appartement, dates, voyageurs } = state || {};
  const navigate = useNavigate();

  if (!appartement) {
    return <div>Erreur : aucune donnée d'appartement reçue.</div>;
  }

  const nuits = 5;
  const total =
    appartement.prixParNuit * nuits +
    appartement.fraisMenage +
    appartement.fraisService;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Colonne de gauche */}
          <div className="space-y-8">
            <h1 className="text-[32px] font-semibold">Confirmer et payer</h1>

            <div className="border-b pb-8">
              <h2 className="text-[22px] font-semibold mb-6">Votre voyage</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Dates</h3>
                    <p className="text-gray-600">{dates.arrivee} - {dates.depart}</p>
                  </div>
                  <button className="text-black underline font-semibold">Modifier</button>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">Voyageurs</h3>
                    <p className="text-gray-600">{voyageurs} voyageur(s)</p>
                  </div>
                  <button className="text-black underline font-semibold">Modifier</button>
                </div>
              </div>
            </div>

            <div className="border-b pb-8">
              <h2 className="text-[22px] font-semibold mb-6">Choisissez comment payer</h2>
              <div className="space-y-4">
                <div className="border rounded-xl p-4 cursor-pointer hover:border-black">
                  <label className="flex items-center space-x-4">
                    <input type="radio" name="paiement" defaultChecked className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Payer la totalité</p>
                      <p className="text-gray-600">Payez {total.toFixed(2)} € maintenant</p>
                    </div>
                  </label>
                </div>
                <div className="border rounded-xl p-4 cursor-pointer hover:border-black opacity-50">
                  <label className="flex items-center space-x-4">
                    <input type="radio" name="paiement" disabled className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Payer en plusieurs fois</p>
                      <p className="text-gray-600">Option non disponible pour le moment</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-b pb-8">
              <h2 className="text-[22px] font-semibold mb-6">Connectez-vous ou inscrivez-vous</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Pays/Région</label>
                  <select className="w-full p-3 border rounded-lg hover:border-black">
                    <option>France (+33)</option>
                    <option>Belgique (+32)</option>
                    <option>Suisse (+41)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Numéro de téléphone</label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    className="w-full p-3 border rounded-lg hover:border-black"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Nous vous appellerons ou vous enverrons un SMS pour confirmer votre numéro. Les frais standards s'appliquent.
                </p>
              </div>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="lg:pl-12">
            <div className="sticky top-8 border rounded-xl p-6 space-y-6">
              <div className="flex space-x-4">
                <img
                  src={appartement.images[0]}
                  alt={appartement.titre}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{appartement.titre}</h3>
                  <p className="text-sm text-gray-600">
                    ⭐ {appartement.note} ({appartement.nombreAvis} avis)
                  </p>
                </div>
              </div>

              <div className="border-t border-b py-6">
                <h3 className="font-semibold mb-4">Le prix détaillé</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="underline">{appartement.prixParNuit} € x {nuits} nuits</span>
                    <span>{(appartement.prixParNuit * nuits).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Frais de ménage</span>
                    <span>{appartement.fraisMenage} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Frais de service</span>
                    <span>{appartement.fraisService} €</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
