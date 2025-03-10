import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appartements } from "../Api.js/api";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AppartementCalendar from '../components/AppartementCalendar';
import SmoobuReservation from "../components/SmoobuReservation";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function AppartementDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const appartement = appartements.find((apt) => apt.id === parseInt(id));

  const [showEquipements, setShowEquipements] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [voyageurs, setVoyageurs] = useState(2);

  // Coordonnées factices pour la démo - à remplacer par les vraies coordonnées
  const position = [49.1193089, 6.1757156]; // Coordonnées pour Metz

  console.log(appartement)
  if (!appartement) return <div className="text-center py-20">Appartement non trouvé.</div>;

  const totalPrix =
    appartement.prixParNuit * 5 + appartement.fraisMenage + appartement.fraisService;

  const handleReservation = () => {
    if (!dateArrivee || !dateDepart) {
      alert("Veuillez sélectionner vos dates de séjour");
      return;
    }
    navigate("/reservation", {
      state: { appartement, voyageurs, dates: { arrivee: dateArrivee, depart: dateDepart } },
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: appartement.titre,
          text: `Découvrez ${appartement.titre} sur Livence`,
          url: window.location.href
        });
      } else {
        // Fallback - copier le lien dans le presse-papier
        await navigator.clipboard.writeText(window.location.href);
        alert("Lien copié dans le presse-papier !");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const getEquipementIcon = (item) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('wifi')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M16 20a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-7a8 8 0 0 1 8 8h-2a6 6 0 0 0-12 0H8a8 8 0 0 1 8-8zm0-7a15 15 0 0 1 15 15h-2A13 13 0 0 0 16 10a13 13 0 0 0-13 13H1a15 15 0 0 1 15-15zm0-7a22 22 0 0 1 22 22h-2A20 20 0 0 0 16 3 20 20 0 0 0-3.9 19.1l-1.8-.8A22 22 0 0 1 16 1z"/></svg>
    } else if (itemLower.includes('cuisine')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M26 1a5 5 0 0 1 5 5c0 6.389-1.592 13.187-4 14.693V31h-2V20.694c-2.364-1.478-3.942-8.062-3.998-14.349L21 6l.005-.217A5 5 0 0 1 26 1zm-9 0v18.118c2.317.557 4 3.01 4 5.882 0 3.27-2.183 6-5 6s-5-2.73-5-6c0-2.872 1.683-5.326 4-5.882V1zM2 1h1c4.47 0 6.934 6.365 6.999 18.505L10 21H3.999L4 31H2zm14 20c-1.602 0-3 1.748-3 4s1.398 4 3 4 3-1.748 3-4-1.398-4-3-4zM4 3.239V19h3.995L8 18.999C7.94 8.504 6.035 3.239 4 3.239zm22-1.239c-1.657 0-3 1.343-3 3 0 5.493 1.021 11.285 2 12.675V4.517L25.005 4c.048-.405.157-.793.319-1.151-.018-.02-.036-.04-.054-.06A2.971 2.971 0 0 0 26 2z"/></svg>
    } else if (itemLower.includes('tv') || itemLower.includes('télé')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M9 29v-2h2v-2H6a5 5 0 0 1-5-4.783V8a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v12.217A5 5 0 0 1 26 25h-5v2h2v2zm10-4h-6v2h6zm7-20H6a3 3 0 0 0-3 3v12.217A3 3 0 0 0 6 23h20a3 3 0 0 0 3-2.783V8a3 3 0 0 0-3-3z"/></svg>
    } else if (itemLower.includes('parking')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M26 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm14.6-5.5c0 .1-3.3-5.1-3.3-5.1a3 3 0 0 0-2.6-1.5H11.3a3 3 0 0 0-2.6 1.5L5.4 13.5M4 24h28M7 14h18"/></svg>
    } else if (itemLower.includes('climatisation') || itemLower.includes('clim')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M17 1v4.03l4.026-2.324 1 1.732L17 7.339v6.928l6-3.464V5h2v4.648l3.026-1.747 1 1.732L26 11.381v7.237l4.026 2.324-1 1.732L24 19.777v6.929l6 3.464-1 1.732-6-3.464V32h-2v-2.536l-6 3.464-1-1.732 6-3.464v-6.929l-6 3.464V29h-2v-4.536l-4.026 2.324-1-1.732L12 22.619v-7.237l-4.026-2.324 1-1.732L13 13.119V8.464L7 11.928V13H5v-2.536l-4.026 2.324-1-1.732L5 8.119V1.999h2v4.083l6-3.464 1 1.732L9 7.293v6.928l6-3.464V5h2zM15 21.648l-6 3.464V29h2v-2.536l4.026-2.324-.026 1.732zm-6-9.585v7.237l6-3.463v-7.238l-6 3.464zm8-3.774v7.238l6-3.464v-7.237l-6 3.463zm6 9.585L17 21.337v7.238l6-3.464v-7.237z"/></svg>
    } else if (itemLower.includes('piscine')) {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M24 26c.988 0 1.945.351 2.671 1.009.306.276.71.445 1.142.483L28 27.5v2l-.228-.006a3.96 3.96 0 0 1-2.443-1.003A1.978 1.978 0 0 0 24 28c-.502 0-.978.175-1.328.491a3.977 3.977 0 0 1-2.67 1.009 3.977 3.977 0 0 1-2.672-1.009A1.978 1.978 0 0 0 16 28c-.503 0-.98.175-1.329.491a3.978 3.978 0 0 1-2.67 1.009 3.978 3.978 0 0 1-2.672-1.008A1.978 1.978 0 0 0 8 28c-.503 0-.98.175-1.33.491a3.96 3.96 0 0 1-2.442 1.003L4 29.5v-2l.187-.008a1.953 1.953 0 0 0 1.142-.483A3.975 3.975 0 0 1 8 26c.988 0 1.945.352 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.492A3.974 3.974 0 0 1 16 26c.988 0 1.945.351 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.491A3.975 3.975 0 0 1 23.999 26zm0-5c.988 0 1.945.351 2.671 1.009.306.276.71.445 1.142.483L28 22.5v2l-.228-.006a3.96 3.96 0 0 1-2.443-1.003A1.978 1.978 0 0 0 24 23c-.502 0-.978.175-1.328.491a3.977 3.977 0 0 1-2.67 1.009 3.977 3.977 0 0 1-2.672-1.009A1.978 1.978 0 0 0 16 23c-.503 0-.98.175-1.329.491a3.978 3.978 0 0 1-2.67 1.009 3.978 3.978 0 0 1-2.672-1.008A1.978 1.978 0 0 0 8 23c-.503 0-.98.175-1.33.491a3.96 3.96 0 0 1-2.442 1.003L4 24.5v-2l.187-.008a1.953 1.953 0 0 0 1.142-.483A3.975 3.975 0 0 1 8 21c.988 0 1.945.352 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.492A3.974 3.974 0 0 1 16 21c.988 0 1.945.351 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.491A3.975 3.975 0 0 1 23.999 21zM24 16c.988 0 1.945.351 2.671 1.009.306.276.71.445 1.142.483L28 17.5v2l-.228-.006a3.96 3.96 0 0 1-2.443-1.003A1.978 1.978 0 0 0 24 18c-.502 0-.978.175-1.328.491a3.977 3.977 0 0 1-2.67 1.009 3.977 3.977 0 0 1-2.672-1.009A1.978 1.978 0 0 0 16 18c-.503 0-.98.175-1.329.491a3.978 3.978 0 0 1-2.67 1.009 3.978 3.978 0 0 1-2.672-1.008A1.978 1.978 0 0 0 8 18c-.503 0-.98.175-1.33.491a3.96 3.96 0 0 1-2.442 1.003L4 19.5v-2l.187-.008a1.953 1.953 0 0 0 1.142-.483A3.975 3.975 0 0 1 8 16c.988 0 1.945.352 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.492A3.974 3.974 0 0 1 16 16c.988 0 1.945.351 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.491A3.975 3.975 0 0 1 23.999 16zm0-5c.988 0 1.945.351 2.671 1.009.306.276.71.445 1.142.483L28 12.5v2l-.228-.006a3.96 3.96 0 0 1-2.443-1.003A1.978 1.978 0 0 0 24 13c-.502 0-.978.175-1.328.491a3.977 3.977 0 0 1-2.67 1.009 3.977 3.977 0 0 1-2.672-1.009A1.978 1.978 0 0 0 16 13c-.503 0-.98.175-1.329.491a3.978 3.978 0 0 1-2.67 1.009 3.978 3.978 0 0 1-2.672-1.008A1.978 1.978 0 0 0 8 13c-.503 0-.98.175-1.33.491a3.96 3.96 0 0 1-2.442 1.003L4 14.5v-2l.187-.008a1.953 1.953 0 0 0 1.142-.483A3.975 3.975 0 0 1 8 11c.988 0 1.945.352 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.492A3.974 3.974 0 0 1 16 11c.988 0 1.945.351 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.491A3.975 3.975 0 0 1 23.999 11zM24 6c.988 0 1.945.351 2.671 1.009.306.276.71.445 1.142.483L28 7.5v2l-.228-.006a3.96 3.96 0 0 1-2.443-1.003A1.978 1.978 0 0 0 24 8c-.502 0-.978.175-1.328.491a3.977 3.977 0 0 1-2.67 1.009 3.977 3.977 0 0 1-2.672-1.009A1.978 1.978 0 0 0 16 8c-.503 0-.98.175-1.329.491a3.978 3.978 0 0 1-2.67 1.009 3.978 3.978 0 0 1-2.672-1.008A1.978 1.978 0 0 0 8 8c-.503 0-.98.175-1.33.491a3.96 3.96 0 0 1-2.442 1.003L4 9.5v-2l.187-.008a1.953 1.953 0 0 0 1.142-.483A3.975 3.975 0 0 1 8 6c.988 0 1.945.352 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.492A3.974 3.974 0 0 1 16 6c.988 0 1.945.351 2.671 1.009.35.316.826.49 1.33.491.502 0 .979-.175 1.328-.491A3.975 3.975 0 0 1 23.999 6z"/></svg>
    } else {
      return <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M24 1a5 5 0 0 1 5 5c0 6.389-1.592 13.187-4 14.693V31h-2V20.694c-2.364-1.478-3.942-8.062-3.998-14.349L19 6l.005-.217A5 5 0 0 1 24 1zM9 1h1c4.47 0 6.934 6.365 6.999 18.505L17 21H3.999L4 31H2zm14 20c-1.602 0-3 1.748-3 4s1.398 4 3 4 3-1.748 3-4-1.398-4-3-4z"/></svg>
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Titre */}
      <h1 className="text-2xl font-semibold mb-2">{appartement.titre}</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">⭐ {appartement.note}</span>
          <span>•</span>
          <span className="underline">{appartement.nombreAvis} avis</span>
          <span>•</span>
          <span className="underline">{appartement.localisation}</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            <svg viewBox="0 0 32 32" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false"><path d="M25 16.67l-9.5 9.47v-7.13a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v7.13L2 16.67V30h23v-3.33zM27.5 0h-23A2.5 2.5 0 0 0 2 2.5v11.67l9.5 9.47V14.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v9.14l9.5-9.47V2.5A2.5 2.5 0 0 0 27.5 0z"></path></svg>
            Partager
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg">
            <svg viewBox="0 0 32 32" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false"><path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path></svg>
            Enregistrer
          </button>
        </div>
      </div>

      {/* Galerie d'images */}
      <div className="grid grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden h-[400px] relative">
        <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => setSelectedImage(appartement.images[0])}>
          <img src={appartement.images[0]} alt="" className="w-full h-full object-cover hover:opacity-90 transition" />
        </div>
        {appartement.images.slice(1, 5).map((img, i) => (
          <div key={i} className="relative cursor-pointer" onClick={() => setSelectedImage(img)}>
            <img src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition" />
          </div>
        ))}
        <button 
          onClick={() => setSelectedImage(appartement.images[0])}
          className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100"
        >
          Afficher toutes les photos
        </button>
      </div>

      {/* Image sélectionnée en plein écran */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <svg viewBox="0 0 32 32" className="h-8 w-8" stroke="currentColor" strokeWidth="3" fill="none">
              <path d="m6 6 20 20M26 6 6 26"></path>
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}


      {/* Disposition principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Infos à gauche */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start pb-6 border-b">
            <div>
              <h2 className="text-xl font-semibold mb-2">Logement entier hébergé par {appartement.hote.nom}</h2>
              <p className="text-gray-600">
                {appartement.capacite.voyageurs} voyageurs • {appartement.capacite.chambres} chambres • {appartement.capacite.lits} lits • {appartement.capacite.sallesDeBain} salle(s) de bain
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          </div>

          <div className="py-6 border-b space-y-6">
            <div className="flex gap-4">
              <div className="mt-1">
                <svg viewBox="0 0 32 32" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg"><path d="m16 17c3.8659932 0 7-3.1340068 7-7s-3.1340068-7-7-7-7 3.1340068-7 7 3.1340068 7 7 7zm0 2c-3.9764502 0-7.5566566 2.1810267-9.3958722 5.4651035l-.1591278.3348965h19.1c-.6774672-1.4184471-1.6909540-2.6241948-2.9283142-3.5375756-1.5889339-1.1751351-3.5375756-1.8674244-5.6716858-1.8674244z"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Hôte expérimenté</h3>
                <p className="text-gray-500">{appartement.hote.nom} a de l'expérience</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M16 0c6.627 0 12 5.373 12 12 0 6.337-3.814 12.751-11.346 19.257L16 31.82l-0.654-0.563C7.814 24.751 4 18.337 4 12 4 5.373 9.373 0 16 0zm0 2C10.477 2 6 6.477 6 12c0 5.21 3.163 10.722 9.647 16.27L16 28.72l0.353-0.45C22.837 22.722 26 17.21 26 12 26 6.477 21.523 2 16 2zm0 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path></svg>
              </div>
              <div>
                <h3 className="font-medium">Emplacement exceptionnel</h3>
                <p className="text-gray-500">95 % des voyageurs ont attribué 5 étoiles à l'emplacement.</p>
              </div>
            </div>
          </div>

          <div className="py-6 border-b">
            <h2 className="text-xl font-semibold mb-4">À propos de ce logement</h2>
            <p className="text-gray-600 whitespace-pre-line">{appartement.description}</p>
          </div>

          <div className="py-6 border-b">
            <h2 className="text-xl font-semibold mb-6">Ce que propose ce logement</h2>
            <div className="grid grid-cols-2 gap-4">
              {appartement.équipements && Object.entries(appartement.équipements).map(([categorie, items], index) => (
                items.slice(0, 5).map((item, i) => (
                  <div key={`${index}-${i}`} className="flex items-center gap-4">
                    {getEquipementIcon(item)}
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))
              ))}
            </div>
            <button 
              onClick={() => setShowEquipements(true)}
              className="mt-6 px-6 py-3 border border-black rounded-lg font-semibold hover:bg-gray-50"
            >
              Afficher les {appartement.équipements ? Object.values(appartement.équipements).flat().length : 0} équipements
            </button>
          </div>

          {/* Modal des équipements */}
          {showEquipements && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowEquipements(false)}>
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Tous les équipements</h3>
                  <button onClick={() => setShowEquipements(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {appartement.équipements && Object.entries(appartement.équipements).map(([categorie, items]) => (
                  <div key={categorie} className="mb-8">
                    <h4 className="text-xl font-semibold mb-4">{categorie}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          {getEquipementIcon(item)}
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Carte réservation à droite */}
        <div className="relative">
  <div className="sticky top-24 border rounded-xl p-6 shadow-lg bg-white">
    <SmoobuReservation appartementId={appartement.smoobuId} />
  </div>
  </div>
        <div className="my-8">
  <h2 className="text-2xl font-semibold mb-4">Où se situe l'appartement où vous allez séjourner ?</h2>
  <div className="max-w-[1280px] mx-auto">
    <MapContainer 
      center={position} 
      zoom={13} 
      scrollWheelZoom={true} 
      className="w-full h-[550px] rounded-xl shadow-lg z-[0]"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={position}>
        <Popup>
          {appartement.titre}
        </Popup>
      </Marker>
    </MapContainer>
  </div>
      

</div>

      </div>
    </div>
  );
}
