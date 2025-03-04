export default function Proprietaires() {
    return (
      <div className="bg-dark text-light min-h-screen py-20 px-4">
        <h1 className="text-4xl font-bold text-center text-cyan mb-12">
          Propriétaires : Découvrez nos services
        </h1>
  
        <div className="max-w-3xl mx-auto text-center">
          <p className="mb-8">
            Estimez vos gains potentiels, découvrez nos avantages et rejoignez notre réseau de partenaires !
          </p>
          <button
            className="bg-cyan text-dark px-6 py-3 rounded-full font-semibold hover:bg-cyan/80 transition"
          >
            Simuler mes revenus
          </button>
        </div>
      </div>
    );
  }
  