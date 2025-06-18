import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaSearch, FaHome, FaCreditCard, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openItems, setOpenItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Toutes les questions', icon: FaQuestionCircle },
    { id: 'booking', name: 'Réservations', icon: FaHome },
    { id: 'payment', name: 'Paiements', icon: FaCreditCard },
    { id: 'account', name: 'Compte utilisateur', icon: FaUsers },
    { id: 'safety', name: 'Sécurité', icon: FaShieldAlt }
  ];

  const faqItems = [
    {
      category: 'booking',
      question: "Comment puis-je réserver un appartement sur Livence ?",
      answer: "Pour réserver un appartement, parcourez notre sélection d'appartements, choisissez celui qui vous convient, sélectionnez vos dates de séjour et le nombre d'invités, puis suivez le processus de réservation. Vous recevrez une confirmation par email une fois la réservation finalisée."
    },
    {
      category: 'booking',
      question: "Puis-je modifier ou annuler ma réservation ?",
      answer: "Oui, vous pouvez modifier ou annuler votre réservation depuis votre espace personnel. Les conditions d'annulation varient selon la propriété et le délai avant le séjour. Consultez les conditions spécifiques lors de votre réservation."
    },
    {
      category: 'booking',
      question: "Que se passe-t-il si le propriétaire annule ma réservation ?",
      answer: "Si un propriétaire annule votre réservation, vous serez immédiatement remboursé intégralement. Nous vous aiderons également à trouver un logement alternatif similaire dans la même zone si possible."
    },
    {
      category: 'payment',
      question: "Quels modes de paiement acceptez-vous ?",
      answer: "Nous acceptons toutes les cartes de crédit principales (Visa, MasterCard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés et cryptés."
    },
    {
      category: 'payment',
      question: "Quand suis-je débité pour ma réservation ?",
      answer: "Le paiement est généralement prélevé au moment de la confirmation de votre réservation. Pour certaines propriétés, un acompte peut être demandé lors de la réservation et le solde avant votre arrivée."
    },
    {
      category: 'payment',
      question: "Les prix affichés incluent-ils tous les frais ?",
      answer: "Les prix affichés incluent l'hébergement. Les frais de service, taxes de séjour locales et éventuels frais de nettoyage sont clairement indiqués avant la finalisation de votre réservation."
    },
    {
      category: 'account',
      question: "Comment créer un compte sur Livence ?",
      answer: "Cliquez sur 'S'inscrire' en haut de la page, remplissez vos informations personnelles et vérifiez votre adresse email. Vous pouvez aussi vous connecter via vos comptes Google ou Facebook pour plus de simplicité."
    },
    {
      category: 'account',
      question: "Comment récupérer mon mot de passe oublié ?",
      answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre adresse email, et suivez les instructions envoyées dans votre boîte mail pour réinitialiser votre mot de passe."
    },
    {
      category: 'account',
      question: "Puis-je avoir plusieurs réservations en même temps ?",
      answer: "Oui, vous pouvez gérer plusieurs réservations simultanément depuis votre espace personnel. Chaque réservation est traitée indépendamment avec ses propres conditions."
    },
    {
      category: 'safety',
      question: "Comment Livence assure-t-elle la sécurité des paiements ?",
      answer: "Nous utilisons un cryptage SSL de niveau bancaire pour toutes les transactions. Vos informations de paiement ne sont jamais stockées sur nos serveurs et sont traitées par des partenaires de paiement certifiés PCI DSS."
    },
    {
      category: 'safety',
      question: "Comment vérifiez-vous la qualité des appartements ?",
      answer: "Tous nos appartements sont vérifiés par notre équipe. Nous effectuons des contrôles de qualité réguliers et nous basons sur les avis clients pour maintenir nos standards élevés."
    },
    {
      category: 'safety',
      question: "Que faire en cas de problème pendant mon séjour ?",
      answer: "Notre service client est disponible 24h/24 et 7j/7 pour vous aider. Vous pouvez nous contacter via la messagerie intégrée, par téléphone ou email pour toute urgence ou problème."
    },
    {
      category: 'booking',
      question: "Puis-je arriver en dehors des heures standard ?",
      answer: "La plupart de nos propriétés offrent une flexibilité pour l'arrivée. Les modalités d'arrivée tardive ou matinale sont précisées dans la description de chaque appartement. Contactez le propriétaire pour organiser votre arrivée."
    },
    {
      category: 'booking',
      question: "Y a-t-il une limite d'âge pour réserver ?",
      answer: "Vous devez avoir au moins 18 ans pour effectuer une réservation sur Livence. Cette personne doit être présente lors du check-in et est responsable de la réservation."
    },
    {
      category: 'payment',
      question: "Proposez-vous une assurance annulation ?",
      answer: "Oui, nous proposons une assurance annulation optionnelle lors de votre réservation. Cette assurance couvre l'annulation pour certaines raisons comme la maladie, les urgences familiales ou les problèmes de transport."
    }
  ];

  const toggleItem = (index) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Questions Fréquentes
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses à vos questions sur Livence
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-slate-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <category.icon className="mr-2 text-sm" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <FaQuestionCircle className="mx-auto text-gray-400 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucune question trouvée
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
              </p>
            </div>
          ) : (
            filteredFAQs.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <FaChevronUp className="text-slate-600 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 text-center border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Notre équipe de support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/messagerie"
              className="inline-flex items-center justify-center bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors duration-200"
            >
              <FaQuestionCircle className="mr-2" />
              Contacter le support
            </Link>
            <Link 
              to="/about"
              className="inline-flex items-center justify-center border border-slate-600 text-slate-600 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
            >
              En savoir plus sur Livence
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <FaHome className="mx-auto text-3xl text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Parcourir les appartements
            </h3>
            <p className="text-gray-600 mb-4">
              Découvrez notre sélection d'appartements disponibles
            </p>
            <Link 
              to="/"
              className="text-slate-600 hover:text-slate-700 font-medium"
            >
              Voir les appartements →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <FaUsers className="mx-auto text-3xl text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Créer un compte
            </h3>
            <p className="text-gray-600 mb-4">
              Rejoignez Livence pour gérer vos réservations facilement
            </p>
            <Link 
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              S'inscrire →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <FaQuestionCircle className="mx-auto text-3xl text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              À propos de nous
            </h3>
            <p className="text-gray-600 mb-4">
              Découvrez notre mission et nos valeurs
            </p>
            <Link 
              to="/about"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 