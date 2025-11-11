import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaHome, FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaExclamation } from 'react-icons/fa';

const Calendar = () => {
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState('2909676');
  const [calendarData, setCalendarData] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = 'ERO6nXtsINvnKz0gDvdNS5p82qX0vol1EUU98XVChY';
  const SMOOBU_API_BASE = 'https://login.smoobu.com/api';

  const apartments = [
    { id: '2918431', name: 'Appartement Centre-Ville', location: 'Paris, France' },
    { id: '2909676', name: 'Studio Moderne', location: 'Lyon, France' }
  ];

  // Fonction pour récupérer les données du calendrier depuis l'API Smoobu
  const fetchCalendarData = async (apartmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SMOOBU_API_BASE}/bookings?apartmentId=${apartmentId}`, {
        headers: {
          'Api-Key': API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de charger les données du calendrier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedApartment);
  }, [selectedApartment]);

  const handleApartmentChange = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir le statut d'une date
  const getDateStatus = (date: Date) => {
    if (!calendarData) return 'available';
    
    const dateStr = date.toISOString().split('T')[0];
    const booking = calendarData.find((booking: any) => {
      const arrival = new Date(booking.arrival).toISOString().split('T')[0];
      const departure = new Date(booking.departure).toISOString().split('T')[0];
      return dateStr >= arrival && dateStr < departure;
    });

    if (booking) {
      return booking.status === 'confirmed' ? 'booked' : 'pending';
    }
    return 'available';
  };

  // Générer les jours du mois actuel
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Ajouter les jours vides du début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-4xl text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Calendrier des Disponibilités</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Consultez les disponibilités de nos appartements en temps réel
          </p>
        </div>

        {/* Apartment Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaHome className="mr-2 text-blue-600" />
            Sélectionner un Appartement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apartments.map((apartment) => (
              <button
                key={apartment.id}
                onClick={() => handleApartmentChange(apartment.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedApartment === apartment.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">{apartment.name}</h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaMapMarkerAlt className="mr-1 text-sm" />
                    {apartment.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">ID: {apartment.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <FaClock className="mr-2" />
              Calendrier de Disponibilités
            </h2>
            <p className="text-blue-100 mt-1">
              Appartement sélectionné: {apartments.find(apt => apt.id === selectedApartment)?.name}
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement du calendrier...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaExclamation className="text-red-500 text-4xl mx-auto mb-4" />
                  <p className="text-red-600 text-lg">{error}</p>
                  <button 
                    onClick={() => fetchCalendarData(selectedApartment)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : (
              <div className="calendar-container">
                {/* En-tête du calendrier */}
                <div className="calendar-header mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 text-center">
                    {new Date().toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    }).charAt(0).toUpperCase() + 
                    new Date().toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    }).slice(1)}
                  </h3>
                </div>

                {/* Grille du calendrier */}
                <div className="calendar-grid bg-white rounded-lg shadow-sm border">
                  {/* Jours de la semaine */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                      <div key={day} className="bg-gray-100 p-3 text-center font-medium text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Jours du mois */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {generateCalendarDays().map((date, index) => {
                      if (!date) {
                        return <div key={index} className="bg-white p-3 min-h-[60px]"></div>;
                      }

                      const status = getDateStatus(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 min-h-[60px] flex flex-col items-center justify-center border-r border-b ${
                            status === 'booked' ? 'bg-red-100 text-red-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-50 text-green-800 hover:bg-green-100'
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                            {date.getDate()}
                          </span>
                          <div className="mt-1">
                            {status === 'booked' && <FaTimes className="text-red-500 text-xs" />}
                            {status === 'pending' && <FaExclamation className="text-yellow-500 text-xs" />}
                            {status === 'available' && <FaCheck className="text-green-500 text-xs" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Informations sur les réservations */}
                {calendarData && calendarData.length > 0 && (
                  <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Réservations actuelles</h4>
                    <div className="space-y-2">
                      {calendarData.slice(0, 5).map((booking: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{booking.guestName || 'Client anonyme'}</span>
                            <span className="text-gray-600 ml-2">
                              {formatDate(booking.arrival)} - {formatDate(booking.departure)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Légende</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-3" />
              <span className="text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center">
              <FaTimes className="text-red-500 mr-3" />
              <span className="text-gray-700">Occupé</span>
            </div>
            <div className="flex items-center">
              <FaExclamation className="text-yellow-500 mr-3" />
              <span className="text-gray-700">Réservation en attente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
