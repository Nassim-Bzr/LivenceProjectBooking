import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const AppartementAvis = () => {
  const { slug } = useParams();
  const [appartement, setAppartement] = useState(null);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des informations de l'appartement
        const resAppart = await axios.get(`http://localhost:5000/api/appartements/slug/${slug}`);
        setAppartement(resAppart.data);
        
        // En attendant la configuration du backend, on utilise des données fictives
        // Normalement on ferait une requête comme:
        // const resAvis = await axios.get(`http://localhost:5000/api/appartements/${resAppart.data.id}/avis`);
        // setAvis(resAvis.data);
        
        // Données fictives pour les avis
        setAvis(generateFakeReviews(resAppart.data.nombreAvis, resAppart.data.note));
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Fonction pour générer des avis fictifs
  const generateFakeReviews = (count, averageRating) => {
    const reviews = [];
    const usernames = [
      "Sophie Martin", "Thomas Dubois", "Emma Bernard", "Lucas Moreau", 
      "Chloé Petit", "Hugo Leroy", "Léa Roux", "Jules Fournier", 
      "Manon Girard", "Nathan Bonnet", "Camille Dupont", "Louis Lambert"
    ];
    
    const comments = [
      "Superbe appartement, très bien situé et confortable !",
      "Séjour parfait, l'hôte était très accueillant et disponible.",
      "Très propre et conforme aux photos. Je recommande !",
      "Vue magnifique et quartier calme, idéal pour se reposer.",
      "Excellent rapport qualité-prix, je reviendrai avec plaisir.",
      "Décoration soignée et équipements de qualité.",
      "Appartement spacieux et lumineux, parfait pour notre famille.",
      "Localisation idéale, proche des commerces et transports.",
      "L'appartement est encore plus beau en vrai que sur les photos !",
      "Hôte très réactif et de bons conseils pour visiter la région.",
      "Un peu bruyant le matin, mais l'appartement est très agréable.",
      "Petit mais très fonctionnel, parfait pour un court séjour."
    ];

    for (let i = 0; i < count; i++) {
      // Générer une note qui tourne autour de la moyenne
      let rating = Math.round(Math.max(1, Math.min(5, averageRating + (Math.random() - 0.5) * 2)));
      
      // Date aléatoire dans les 6 derniers mois
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
      
      reviews.push({
        id: i + 1,
        userName: usernames[Math.floor(Math.random() * usernames.length)],
        rating: rating,
        comment: comments[Math.floor(Math.random() * comments.length)],
        date: date.toISOString(),
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 70) + 1}.jpg`
      });
    }
    
    // Trier par date décroissante (plus récent en premier)
    return reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fonction pour générer les étoiles en fonction de la note
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? "text-yellow-400" : "text-gray-300"} 
      />
    ));
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calcul des statistiques
  const calculateStats = (reviews) => {
    const stats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    
    reviews.forEach(review => {
      stats[review.rating]++;
    });
    
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = calculateStats(avis);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to={`/appartement/${slug}`} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" />
        Retour à l'appartement
      </Link>

      {appartement && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{appartement.titre}</h1>
            <div className="flex items-center text-lg">
              <div className="flex items-center mr-2">
                {renderStars(appartement.note)}
              </div>
              <span className="font-semibold">{appartement.note.toFixed(1)}</span>
              <span className="mx-2">•</span>
              <span>{appartement.nombreAvis} avis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Évaluation globale</h3>
                
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center mb-2">
                    <div className="w-12 text-sm">{rating} étoiles</div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full" 
                          style={{ width: `${(stats[rating] / avis.length * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm">
                      {stats[rating] || 0} avis
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-8">
                {avis.map((review) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-start">
                      <img 
                        src={review.avatar} 
                        alt={review.userName} 
                        className="w-12 h-12 rounded-full mr-4" 
                      />
                      <div>
                        <div className="font-medium">{review.userName}</div>
                        <div className="text-gray-500 text-sm mb-2">{formatDate(review.date)}</div>
                        <div className="flex mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppartementAvis; 