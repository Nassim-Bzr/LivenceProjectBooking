import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaHome, FaShieldAlt, FaCog, FaExchangeAlt, FaHandHoldingUsd } from 'react-icons/fa';

export default function Livence() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission later
    console.log('Form submitted:', formData);
    alert('Formulaire soumis ! (Fonctionnalité à implémenter)');
  };

  // Fonction pour scroll vers le formulaire
  const scrollToForm = () => {
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Effet de highlight temporaire
      setTimeout(() => {
        formElement.style.transform = 'scale(1.02)';
        formElement.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          formElement.style.transform = 'scale(1)';
          setTimeout(() => {
            formElement.style.transition = '';
          }, 300);
        }, 200);
      }, 800);
    }
  };

  const testimonials = [
    {
      text: "Je suis vraiment content de travailler avec LIVENCE. Leur équipe est très professionnelle et fiable. Les paiements sont toujours à l'heure, et je n'ai jamais eu à me soucier de l'état de mes appartements. La gestion est simple et claire. Je recommande LIVENCE à tous les propriétaires qui cherchent une solution de sous-location sans soucis !",
      author: "Luc C - Propriétaire à Olivet",
      rating: 5
    },
    {
      text: "Depuis que je collabore avec LIVENCE, la gestion de mes biens s'est nettement améliorée. Les locataires sont bien choisis et l'entretien des appartements est toujours impeccable. Leur flexibilité et leur service personnalisé font vraiment la différence. C'est un vrai soulagement d'avoir un partenaire aussi fiable.",
      author: "Marie D - Propriétaire à Orléans",
      rating: 5
    },
    {
      text: "Super service avec LIVENCE ! Les paiements sont toujours à l'heure, et mes appartements sont bien entretenus. Je recommande sans hésiter !",
      author: "Adrien B - Propriétaire à Olivet",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <FaHandHoldingUsd className="text-6xl text-blue-600 mb-4" />,
      title: "Revenus locatifs garantis",
      description: "En nous choisissant comme locataire, vous recevez votre loyer fixe chaque mois, sans souci de vacance ou d'impayés. Et ainsi, profitez d'une tranquillité d'esprit et d'un revenu stable toute l'année.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: <FaCog className="text-6xl text-green-600 mb-4" />,
      title: "Aucune Gestion",
      description: "Nous prenons soin de votre bien comme si c'était le nôtre : toujours propre et fonctionnel, sans aucun frais pour vous. Notre équipe de professionnels dédiée veille à garder votre logement en parfait état.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: <FaExchangeAlt className="text-6xl text-purple-600 mb-4" />,
      title: "Flexibilité totale",
      description: "Récupérez votre bien à tout moment, sans délai de préavis. Vous restez maître de votre bien.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      icon: <FaShieldAlt className="text-6xl text-red-600 mb-4" />,
      title: "Sécurité et assurance",
      description: "Chaque location est couverte par une assurance spécifique contre les dommages, vous assurant une tranquillité d'esprit. Et, nous contrôlons rigoureusement chaque \"voyageur\" pour assurer la sécurité du logement.",
      image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  const faqItems = [
    {
      question: "Comment fonctionne le service Livence ?",
      answer: "Livence devient votre locataire officiel. Nous signons un bail d'un an renouvelable et nous occupons de la sous-location, garantissant votre loyer chaque mois."
    },
    {
      question: "Quels sont les frais ?",
      answer: "Aucun frais pour vous ! Nous prenons en charge tous les coûts de gestion, maintenance et assurance."
    },
    {
      question: "Puis-je récupérer mon bien ?",
      answer: "Oui, vous gardez une flexibilité totale et pouvez récupérer votre bien à tout moment."
    },
    {
      question: "Comment êtes-vous assurés ?",
      answer: "Chaque location est couverte par une assurance spécifique qui protège votre bien contre les dommages."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white py-32 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <span className="block bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                Livence
              </span>
            </motion.h1>
            <motion.p 
              className="text-2xl md:text-3xl mb-12 font-light text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Le locataire rêvé pour votre bien immobilier
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="space-y-4"
            >
              <motion.button
                onClick={scrollToForm}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-10 py-5 rounded-full text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                🏠 Proposer mon logement
              </motion.button>
              <div className="flex justify-center space-x-8 text-blue-100 text-sm mt-8">
                <span className="flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>Revenus garantis</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>Zéro gestion</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>100% flexible</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500"></div>
        
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir 
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> Livence </span>?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Livence est votre locataire idéal, offrant une solution innovante et sans tracas pour les propriétaires bailleurs. 
              Nous garantissons le versement de votre loyer chaque mois tout en prenant soin de votre bien comme si c'était le nôtre.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <motion.div 
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">+30</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">Propriétaires</div>
              <div className="text-sm text-gray-500">satisfaits de nos services</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">+2000</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">Réservations</div>
              <div className="text-sm text-gray-500">gérées avec succès</div>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">24h</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">Support</div>
              <div className="text-sm text-gray-500">disponible 7j/7</div>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">100%</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">Fiabilité</div>
              <div className="text-sm text-gray-500">de paiement garanti</div>
            </motion.div>
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Votre partenaire de confiance en location</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.button
                onClick={scrollToForm}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                💼 Proposer mon logement
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
              >
                📚 En savoir plus
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full opacity-20"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce que disent nos 
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> propriétaires</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les retours de nos partenaires satisfaits qui nous font confiance au quotidien
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              >
                {/* Quote decoration */}
                <div className="absolute top-6 right-6 text-6xl text-blue-100 font-serif">"</div>
                
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <FaStar className="text-yellow-400 text-xl mr-1" />
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed text-lg italic relative z-10">
                  {testimonial.text}
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.author.split(' ')[0][0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">⭐ Client vérifié</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Trust indicators */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center items-center space-x-8 text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                <span className="font-semibold">4.9/5</span>
                <span className="text-sm ml-1">note moyenne</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                <span className="font-semibold">98%</span>
                <span className="text-sm ml-1">de satisfaction</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🛡️</span>
                <span className="font-semibold">100%</span>
                <span className="text-sm ml-1">sécurisé</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Comment ça marche ?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Avec Livence vous signez un bail meublé d'un an renouvelable, nous autorisant à sous-louer, et nous nous occupons du reste.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Plus de gestion, plus de soucis, juste des revenus stables et un bien immobilier choyé.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-bounce slow"></div>
          <div className="absolute top-3/4 right-10 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nos <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">avantages</span> exclusifs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez pourquoi plus de 1300 propriétaires nous font confiance pour gérer leurs biens
            </p>
          </motion.div>
          
          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 group`}
              >
                <motion.div 
                  className="flex-1 text-center lg:text-left"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex justify-center lg:justify-start mb-8"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl shadow-lg">
                      {feature.icon}
                    </div>
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  {/* Progress indicators based on feature */}
                  <div className="space-y-4">
                    {index === 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Fiabilité des paiements</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            viewport={{ once: true }}
                          ></motion.div>
                        </div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Réduction du temps de gestion</span>
                          <span>95%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "95%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            viewport={{ once: true }}
                          ></motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative group">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-80 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    />
                    {/* Overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Floating badges */}
                    {index === 0 && (
                      <motion.div 
                        className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        viewport={{ once: true }}
                      >
                        💰 Garanti
                      </motion.div>
                    )}
                    {index === 1 && (
                      <motion.div 
                        className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        viewport={{ once: true }}
                      >
                        ⚡ Sans effort
                      </motion.div>
                    )}
                    {index === 2 && (
                      <motion.div 
                        className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        viewport={{ once: true }}
                      >
                        🔄 Flexible
                      </motion.div>
                    )}
                    {index === 3 && (
                      <motion.div 
                        className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        viewport={{ once: true }}
                      >
                        🛡️ Protégé
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">FAQ</h2>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.question}</h3>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-slate-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Prêt à transformer votre 
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> investissement </span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Rejoignez plus de 1300 propriétaires qui ont déjà fait confiance à Livence. 
              Obtenez une estimation personnalisée en moins de 24h !
            </p>
            
                         {/* Trust badges */}
             <div className="flex justify-center items-center space-x-8 mb-12">
               <motion.div 
                 className="flex items-center bg-white px-4 py-2 rounded-full shadow-md"
                 initial={{ opacity: 0, scale: 0 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 viewport={{ once: true }}
               >
                 <span className="text-slate-600 mr-2">✓</span>
                 <span className="text-sm font-medium">Réponse en 24h</span>
               </motion.div>
               <motion.div 
                 className="flex items-center bg-white px-4 py-2 rounded-full shadow-md"
                 initial={{ opacity: 0, scale: 0 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
                 viewport={{ once: true }}
               >
                 <span className="text-blue-500 mr-2">📞</span>
                 <span className="text-sm font-medium">Consultation gratuite</span>
               </motion.div>
               <motion.div 
                 className="flex items-center bg-white px-4 py-2 rounded-full shadow-md"
                 initial={{ opacity: 0, scale: 0 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: 0.6 }}
                 viewport={{ once: true }}
               >
                 <span className="text-slate-600 mr-2">🏆</span>
                 <span className="text-sm font-medium">Sans engagement</span>
               </motion.div>
             </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left side - Contact info */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Parlons de votre projet !</h3>
                
                <div className="space-y-6">
                                     <motion.div 
                     className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-slate-100 rounded-xl"
                     whileHover={{ scale: 1.02 }}
                     transition={{ duration: 0.2 }}
                   >
                     <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">contact@livence.fr</p>
                      <p className="text-sm text-gray-500">Réponse sous 2h en moyenne</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                                          className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-100 to-blue-50 rounded-xl"
                     whileHover={{ scale: 1.02 }}
                     transition={{ duration: 0.2 }}
                   >
                      <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">📞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Téléphone</h4>
                      <p className="text-gray-600">+33 6 52 90 38 03</p>
                      <p className="text-sm text-gray-500">Lun-Ven 9h-18h</p>
                    </div>
                  </motion.div>
                  
                                     <motion.div 
                     className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-100 to-blue-50 rounded-xl"
                     whileHover={{ scale: 1.02 }}
                     transition={{ duration: 0.2 }}
                   >
                     <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-blue-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-xl">⚡</span>
                     </div>
                     <div>
                       <h4 className="font-semibold text-gray-900">Support urgent</h4>
                       <p className="text-gray-600">Disponible 24h/7j</p>
                       <p className="text-sm text-gray-500">Pour vos urgences</p>
                     </div>
                   </motion.div>
                </div>
                
                {/* Stats */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">&lt; 2h</div>
                      <div className="text-sm text-gray-500">Temps de réponse</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-700">98%</div>
                      <div className="text-sm text-gray-500">Clients satisfaits</div>
                    </div>
                  </div>
                </div>
              </div>
              
                             {/* FAQ rapide */}
               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                 <h4 className="font-bold text-gray-900 mb-4">Questions fréquentes :</h4>
                 <ul className="space-y-2 text-sm text-gray-600">
                                       <li className="flex items-center"><span className="text-slate-600 mr-2">•</span> Combien ça coûte ? → Gratuit, nous prenons une commission</li>
                     <li className="flex items-center"><span className="text-blue-500 mr-2">•</span> Combien de temps ? → Mise en ligne sous 48h</li>
                    <li className="flex items-center"><span className="text-slate-600 mr-2">•</span> Et si je change d'avis ? → Résiliation libre à tout moment</li>
                 </ul>
               </div>
            </motion.div>
            
                         {/* Right side - Form */}
             <motion.div 
               id="contact-form"
               className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
             >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Estimation gratuite</h3>
                <p className="text-gray-600">Obtenez le potentiel de revenus de votre bien en 2 minutes</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom*
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="Votre nom"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="Votre prénom"
                    />
                  </motion.div>
                </div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="votre.email@exemple.com"
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Votre projet (optionnel)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 resize-none"
                    placeholder="Ex: Appartement 3 pièces à Lyon, actuellement vide..."
                  />
                </motion.div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                                     className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform"
                >
                  🚀 Obtenir mon estimation gratuite
                </motion.button>
                
                <p className="text-xs text-gray-500 text-center">
                  En soumettant ce formulaire, vous acceptez d'être contacté par Livence. 
                  <br />Pas de spam, juste des informations utiles !
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 