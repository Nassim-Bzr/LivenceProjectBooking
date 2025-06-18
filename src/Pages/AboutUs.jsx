import React from 'react';
import { FaHome, FaShieldAlt, FaHeart, FaStar, FaUsers, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const values = [
    {
      icon: FaHeart,
      title: "Passion de l'hospitalité",
      description: "Nous croyons que chaque séjour doit être une expérience mémorable et chaleureuse."
    },
    {
      icon: FaShieldAlt,
      title: "Confiance et sécurité",
      description: "La sécurité de nos utilisateurs est notre priorité absolue dans toutes nos transactions."
    },
    {
      icon: FaStar,
      title: "Excellence du service",
      description: "Nous nous efforçons d'offrir un service de qualité supérieure à chaque étape du voyage."
    },
    {
      icon: FaGlobe,
      title: "Accessibilité globale",
      description: "Rendre les logements de qualité accessibles partout et pour tous les budgets."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Voyageurs satisfaits" },
    { number: "500+", label: "Appartements disponibles" },
    { number: "50+", label: "Villes couvertes" },
    { number: "4.8/5", label: "Note moyenne" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-600 to-slate-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              À propos de <span className="text-blue-200">Livence</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Votre plateforme de confiance pour des séjours exceptionnels dans des appartements soigneusement sélectionnés
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Chez Livence, nous révolutionnons la façon dont vous découvrez et réservez des appartements pour vos voyages. 
                Notre mission est de connecter les voyageurs avec des logements exceptionnels tout en offrant aux propriétaires 
                une plateforme simple et efficace pour partager leurs biens.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nous croyons que chaque voyage mérite un hébergement qui vous fait vous sentir comme chez vous, 
                avec le confort et les commodités que vous attendez d'une expérience de qualité supérieure.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <FaHome className="mr-2" />
                Découvrir nos appartements
              </Link>
            </div>
            <div className="mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Appartement moderne"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Livence en chiffres
            </h2>
            <p className="text-lg text-gray-600">
              Des résultats qui témoignent de notre engagement
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Les principes qui guident notre travail quotidien et notre vision pour l'avenir
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6 group-hover:bg-blue-500 transition-colors duration-200">
                  <value.icon className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-slate-700 to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à vivre l'expérience Livence ?
          </h2>
          <p className="text-xl text-white mb-8 leading-relaxed">
            Rejoignez des milliers de voyageurs qui ont fait confiance à Livence pour leurs séjours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              <FaHome className="mr-2" />
              Voir les appartements
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <FaUsers className="mr-2" />
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 