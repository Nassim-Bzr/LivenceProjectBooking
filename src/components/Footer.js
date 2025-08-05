import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    alert('Inscription à la newsletter ! (Fonctionnalité à implémenter)');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Livence</h3>
            <p className="text-gray-300">
              Gestion complète de votre logement sans frais.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">NOS COORDONNÉES</h4>
            <p className="text-gray-300 mb-2">contact@livence.fr</p>
            <p className="text-gray-300">+33 6 52 90 38 03</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">CONTACTEZ-NOUS</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse email"
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
                required
              />
              <button 
                type="submit"
                className="bg-blue-600 px-6 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                →
              </button>
            </form>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-gray-700">
          <p className="text-gray-400">© 2024 Livence. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
  