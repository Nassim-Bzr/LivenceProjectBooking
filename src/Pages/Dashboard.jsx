export default function Dashboard() {
    return (
      <div className="bg-dark text-light min-h-screen py-20 px-4">
        <h1 className="text-4xl font-bold text-center text-cyan mb-12">
          Mon espace client
        </h1>
  
        <div className="max-w-4xl mx-auto">
          <p className="text-center mb-8">
            Retrouvez ici votre historique de réservations et gérez vos préférences.
          </p>
  
          <div className="bg-grayCard p-6 rounded-lg shadow-lg">
            <p>Aucune réservation pour le moment.</p>
          </div>
        </div>
      </div>
    );
  }
  