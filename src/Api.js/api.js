export const appartements = [
    {
      id: 1,
      titre: "Studio Zen - Wi-Fi - Parking",
      localisation: "Amnéville, France",
      description: "À deux pas des thermes, ce studio tout équipé vous offre confort et tranquillité. Situé à l'arrière d'une maison, il dispose d'une petite cour privative et d'un parking gratuit. Vous bénéficierez d'un espace moderne avec Wi-Fi, télévision connectée et tout le nécessaire pour un séjour agréable. Idéal pour une escapade détente ou un déplacement professionnel, à proximité du zoo, du casino et des activités d'Amnéville.",
      surface: 25,
      prixParNuit: 55,
      capacite: {
        voyageurs: 2,
        chambres: 1,
        lits: 1,
        sallesDeBain: 1,
      },
      note: 4.0,
      nombreAvis: 4,
      hote: {
        nom: "Adem",
        experience: "1 mois",
        tauxReponse: "100%",
        delaiReponse: "1h",
      },
      regles: {
        arrivee: "15:00 - 00:00",
        depart: "avant 12:00",
        voyageursMax: 2,
      },
      images: [
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1356588712402223396/original/d501cc25-7ac6-4f7b-9f1d-38b15f1ba57b.jpeg?im_w=1200&im_format=avif",
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1356588712402223396/original/4345a7b9-61eb-495e-b5c0-ee5a12a6389d.jpeg?im_w=1440&im_format=avif",
      ],
      équipements: {
        salleDeBain: ["Baignoire", "Produits de nettoyage", "Shampoing", "Eau chaude", "Gel douche"],
        chambreEtLinge: ["Lave-linge"],
        divertissement: ["Télévision"],
        climatisation: ["Climatisation"],
        securite: ["Détecteur de fumée"],
        internetEtBureau: ["Wifi", "Espace de travail dédié"],
        cuisine: ["Cuisine"],
        parking: ["Parking gratuit sur place"],
      },
      inclus: ["Wifi", "Parking gratuit"],
      nonInclus: [
        "Caméras de surveillance extérieures",
        "Sèche-cheveux",
        "Équipements de base",
        "Détecteur de monoxyde de carbone",
        "Entrée privée",
        "Chauffage",
      ],
      politiqueAnnulation: "Flexible",
    },
   
    {
      id: 3,
      titre: "Luxe & Confort | 4 Ch. | Metz",
      localisation: "Metz, France",
      description: "✨ Luxe & Confort à Metz – Appartement Premium 100m²  ✨\n\n🏡 Spacieux et moderne, idéal pour familles ou équipes de travailleurs.\n🛏️ 4 chambres + canapé-lit (10 couchages)\n🚗 Parking gratuit pour plus de confort\n🎬 TV connectée avec Netflix pour vos soirées détente\n🍽️ Cuisine équipée : four, micro-ondes, lave-vaisselle, cafetière\n🧺 Machine à laver à disposition\n☀️ Lumineux et idéalement situé\n🛎️ Linge de lit et serviettes fournis",
      surface: 100,
      prixParNuit: 150,
      capacite: {
        voyageurs: 10,
        chambres: 4,
        lits: 5,
        sallesDeBain: 1
      },
      note: 4.0,
      nombreAvis: 4,
      hote: {
        nom: "Adem",
        experience: "1 mois",
        tauxReponse: "100%",
        delaiReponse: "1h"
      },
      regles: {
        arrivee: "14:00 - 22:00",
        depart: "avant 11:00",
        voyageursMax: 10
      },
      images: [
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1348534205680824880/original/e4231386-bb00-4eb2-9dad-6440cb187f7b.jpeg?im_w=1200&im_format=avif"
      ],
      equipements: {
        salleDeBain: ["Baignoire", "Produits de nettoyage", "Shampooing", "Eau chaude", "Gel douche"],
        chambreEtLinge: ["Lave-linge"],
        divertissement: ["Télévision"],
        climatisation: ["Climatisation"],
        securite: ["Détecteur de fumée"],
        internetEtBureau: ["Wifi", "Espace de travail dédié"],
        cuisine: ["Cuisine", "Espace où les voyageurs peuvent cuisiner"],
        parking: ["Parking gratuit sur place"]
      },
      inclus: ["Wifi", "TV", "Cuisine équipée", "Parking gratuit", "Climatisation"],
      nonInclus: [
        "Caméras de surveillance extérieures",
        "Sèche-cheveux",
        "Équipements de base",
        "Détecteur de monoxyde de carbone",
        "Entrée privée",
        "Chauffage"
      ],
      politiqueAnnulation: "Modérée"
    },
    {
      id: 4,
      titre: "Charme & Confort en Hyper Centre",
      localisation: "Metz, France",
      description: "Situé en plein centre de Metz, cet appartement élégant allie confort et modernité. Lumineux et préparé avec soin, il dispose d'un espace cosy avec Netflix, d'une cuisine entièrement équipée avec four et lave-vaisselle, ainsi que d'un lit confortable. À proximité des boutiques, restaurants et sites emblématiques, il est idéal pour découvrir la ville à pied. Parfait pour un séjour romantique, culturel ou professionnel dans un cadre raffiné.",
      surface: 40,
      prixParNuit: 85,
      capacite: {
        voyageurs: 2,
        chambres: 1,
        lits: 1,
        sallesDeBain: 1
      },
      note: 0,
      nombreAvis: 0,
      hote: {
        nom: "Adem",
        experience: "1 mois",
        tauxReponse: "100%",
        delaiReponse: "1h"
      },
      regles: {
        arrivee: "15:00 - 22:00",
        depart: "avant 11:00",
        voyageursMax: 2
      },
      images: ["https://a0.muscache.com/im/pictures/hosting/Hosting-1370309354606988194/original/306f4225-002f-4a12-ada0-79c499c6ea38.jpeg?im_w=720&im_format=avif"],
      equipements: {
        cuisine: ["Cuisine", "Four", "Lave-vaisselle"],
        divertissement: ["Télévision", "Netflix"],
        internetEtBureau: ["Wifi"],
        climatisation: ["Climatisation"]
      },
      inclus: ["Wifi", "TV", "Cuisine équipée", "Climatisation"],
      nonInclus: ["Détecteur de monoxyde de carbone"],
      politiqueAnnulation: "Flexible"
    }
  ];