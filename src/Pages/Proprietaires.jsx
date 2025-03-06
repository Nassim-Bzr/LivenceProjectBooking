export default function Proprietaires() {
  return (
    <div className="bg-white text-gray-900 min-h-screen ">
      <section
  className="relative bg-cover bg-center bg-no-repeat py-32"
  style={{ backgroundImage: `url("https://prod-saint-gobain-fr.content.saint-gobain.io/sites/saint-gobain.fr/files/2022-04/maison-contemporaine-la-maison-saint-gobain01.jpg")` }}
>
  <div className="bg-black/50 absolute inset-0"></div>
  <div className="relative text-center text-white max-w-3xl mx-auto px-4">
    <h1 className="text-4xl font-extrabold mb-4">
      Maximisez vos revenus locatifs à Metz
    </h1>
    <p className="text-lg mb-6">
      Confiez votre bien à Livence et profitez d'une gestion sans souci avec des revenus garantis et payés en avance.
    </p>
    <button className="bg-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
      Estimez mes revenus
    </button>
  </div>
</section>

      {/* TITRE PRINCIPAL */}
      
      <div className="max-w-5xl mx-auto space-y-16">

        {/* INTRO */}
        

        {/* POURQUOI LIVENCE */}
        <section>
          <h2 className="text-3xl font-bold text-center mt-12 mb-12">
            ⭐ Pourquoi choisir Livence ?
          </h2>
          <p className="text-center mb-10">
            Leader de la gestion locative à Metz depuis notre création, nous visons <strong>500 propriétaires satisfaits</strong> d'ici 2025.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">💰 Sécurité Financière Renforcée</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Paiement des loyers par trimestre</li>
                <li>Revenus locatifs garantis et réguliers</li>
                <li>Aucun risque d'impayé</li>
                <li>Gestion simplifiée</li>
                <li>Cautionnement professionnel sécurisé</li>
                <li>Résiliation facilitée avec préavis réduit</li>
                <li>Protection contre les expulsions</li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">📜 Avantages Fiscaux Préservés</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Statut de bail habitation maintenu</li>
                <li>Mêmes avantages fiscaux qu'un bail classique</li>
                <li>Accompagnement administratif complet</li>
              </ul>
            </div>
          </div>
        </section>

        {/* BIENS EN VEDETTE */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">
            🏡 Biens en vedette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Appartement moderne</h3>
              <p>Centre-ville de Metz • 65 m²</p>
              <p className="font-bold mt-2">850 €/mois</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Studio rénové</h3>
              <p>Quartier Gare • 30 m²</p>
              <p className="font-bold mt-2">550 €/mois</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">Maison familiale</h3>
              <p>Montigny-lès-Metz • 120 m²</p>
              <p className="font-bold mt-2">1200 €/mois</p>
            </div>
          </div>
        </section>

        {/* AVIS CLIENTS */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">
            🗣️ Ce que disent nos propriétaires
          </h2>
          <div className="space-y-6">
            <blockquote className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="italic">
                “Propriétaire inquiète au départ, j'ai été agréablement surprise par le professionnalisme de Livence.”
              </p>
              <footer className="mt-2 font-semibold">– Sophie Martin</footer>
            </blockquote>
            <blockquote className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="italic">
                “Plus d'impayés, plus de dégradations, et un accompagnement personnalisé qui fait toute la différence.”
              </p>
              <footer className="mt-2 font-semibold">– Laurent Dubois</footer>
            </blockquote>
            <blockquote className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="italic">
                “Livence a dépassé mes attentes : revenus garantis et paiements ponctuels.”
              </p>
              <footer className="mt-2 font-semibold">– Marie-Claire Petit</footer>
            </blockquote>
          </div>
        </section>

      </div>
    </div>
  );
}
