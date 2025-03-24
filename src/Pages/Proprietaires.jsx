import React from "react";



export default function Proprietaires() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <section
        className="relative bg-cover bg-center bg-no-repeat py-40"
        style={{ backgroundImage: `url("https://videocdn.cdnpk.net/videos/f2d6eec1-1e8c-4502-9454-e84a2c3c5351/horizontal/thumbnails/large.jpg")` }}
      >
        <div className="bg-black/40 absolute inset-0"></div>
        <div className="relative text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold mb-6">
            Gagnez plus avec votre bien à Metz
          </h1>
          <p className="text-xl mb-8">
            Rejoignez les propriétaires qui font confiance à Livence et augmentez vos revenus locatifs jusqu'à 30% tout en bénéficiant d'une gestion sans stress.
          </p>
          <button className="bg-rose-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-rose-700 transition-colors shadow-lg">
            Estimer mes revenus potentiels
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-20 py-16">
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi les propriétaires choisissent Livence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3">Revenus optimisés</h3>
              <p className="text-gray-600">Augmentez vos revenus locatifs jusqu'à 30% par rapport à une location classique avec des paiements garantis en avance.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">Zéro souci</h3>
              <p className="text-gray-600">Nous gérons tout : de la mise en location à l'entretien, en passant par la gestion des locataires et les démarches administratives.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-3">Flexibilité totale</h3>
              <p className="text-gray-600">Gardez le contrôle avec un accès à votre calendrier et la possibilité d'utiliser votre bien quand vous le souhaitez.</p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl mb-4">📱</div>
              <h3 className="font-semibold mb-2">1. Estimation gratuite</h3>
              <p className="text-gray-600">Découvrez votre potentiel de revenus en quelques clics</p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-4">🤝</div>
              <h3 className="font-semibold mb-2">2. Rencontre</h3>
              <p className="text-gray-600">Visite de votre bien et présentation détaillée de nos services</p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-4">📸</div>
              <h3 className="font-semibold mb-2">3. Mise en valeur</h3>
              <p className="text-gray-600">Photos professionnelles et optimisation de votre annonce</p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-4">✨</div>
              <h3 className="font-semibold mb-2">4. Location active</h3>
              <p className="text-gray-600">Début des revenus garantis et gestion complète</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Ils nous font confiance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sophie" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold">Sophie Martin</h4>
                  <p className="text-gray-500">Propriétaire depuis 2022</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Mes revenus locatifs ont augmenté de 25% depuis que je fais confiance à Livence. Leur équipe est réactive et professionnelle."
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Laurent" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold">Laurent Dubois</h4>
                  <p className="text-gray-500">Propriétaire depuis 2021</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La tranquillité d'esprit que m'apporte Livence n'a pas de prix. Plus de tracas avec les locataires et des revenus garantis."
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à optimiser vos revenus locatifs ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez les propriétaires satisfaits qui nous font confiance à Metz
          </p>
     
        </section>
      </div>
    </div>
  );
}
