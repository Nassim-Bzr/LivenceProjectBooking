import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { FaChevronDown, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Ajouter l'écouteur d'événement quand le menu est ouvert
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Nettoyer l'écouteur quand le menu est fermé ou le composant démonté
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className='flex border-b border-gray-300 py-3 px-4 sm:px-10 bg-white min-h-[65px] tracking-wide relative z-50'>
      <div className='flex flex-wrap items-center gap-4 max-w-screen-xl mx-auto w-full'>
        <Link to="/" className="max-sm:hidden">
          <img src="https://readymadeui.com/readymadeui.svg" alt="logo" className='w-[134px]' />
        </Link>
        <Link to="/" className="hidden max-sm:block">
          <img src="https://readymadeui.com/readymadeui-short.svg" alt="logo" className='w-8' />
        </Link>

        <div id="collapseMenu"
          className={`max-lg:w-full max-lg:fixed max-lg:before:fixed max-lg:before:bg-black/50 max-lg:before:inset-0 max-lg:before:z-50 ${isMenuOpen ? 'block' : 'max-lg:hidden'} lg:block`}>
          <button 
            onClick={toggleMenu}
            className='lg:hidden fixed top-2 right-4 z-[100] rounded-full bg-white w-9 h-9 flex items-center justify-center border'>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-slate-900" viewBox="0 0 320.591 320.591">
              <path
                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                data-original="#000000"></path>
              <path
                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                data-original="#000000"></path>
            </svg>
          </button>

          <ul
            ref={menuRef}
            className='lg:flex lg:ml-14 lg:gap-x-5 max-lg:space-y-3 max-lg:fixed max-lg:bg-white max-lg:w-1/2 max-lg:min-w-[300px] max-lg:top-0 max-lg:left-0 max-lg:p-6 max-lg:h-full max-lg:shadow-md max-lg:overflow-auto z-50'>
            <li className='mb-6 hidden max-lg:block'>
              <Link to="/">
                <img src="https://readymadeui.com/readymadeui.svg" alt="logo" className='w-36' />
              </Link>
            </li>
            <li className='max-lg:border-b max-lg:py-3 px-3'>
              <Link to="/"
                className='font-medium lg:hover:text-blue-700 text-blue-700 block text-[15px]'>Accueil</Link>
            </li>
            <li className='max-lg:border-b max-lg:py-3 px-3'>
              <Link to="/proprietaires"
                className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Propriétaires</Link>
            </li>
            {user ? (
              <>
                <li className='max-lg:border-b max-lg:py-3 px-3'>
                  <Link to="/profile"
                    className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Mon Profil</Link>
                </li>
                <li className='max-lg:border-b max-lg:py-3 px-3'>
                  <Link to="/messagerie"
                    className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px] flex items-center'>
                    <FaEnvelope className="mr-2" /> Messagerie
                  </Link>
                </li>
                {user?.role === 'admin' && (
                  <li className='max-lg:border-b max-lg:py-3 px-3'>
                    <div className="relative">
                      <button
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        className="flex items-center gap-1 text-rose-600 font-medium"
                      >
                        Administration
                        <FaChevronDown className={`transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showAdminMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                          <Link
                            to="/admin/add-appartement"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowAdminMenu(false)}
                          >
                            Ajouter un appartement
                          </Link>
                          <Link
                            to="/admin/reservations"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowAdminMenu(false)}
                          >
                            Gérer les réservations
                          </Link>
                          {/* Ajoutez d'autres liens admin ici */}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {/* Bouton déconnexion pour mobile */}
                <li className='max-lg:border-b max-lg:py-3 px-3 lg:hidden'>
                  <button
                    onClick={handleLogout}
                    className='font-medium text-red-600 block text-[15px] flex items-center'
                  >
                    <FaSignOutAlt className="mr-2" /> Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <li className='max-lg:border-b max-lg:py-3 px-3'>
                <Link to="/login"
                  className='font-medium lg:hover:text-blue-700 text-slate-900 block text-[15px]'>Connexion</Link>
              </li>
            )}
          </ul>
        </div>

        <div className='flex gap-4 ml-auto'>
          {user && (
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/messagerie" className="text-gray-700 hover:text-rose-600" title="Messagerie">
                <FaEnvelope size={20} />
              </Link>
              <Link to="/profile" className="flex items-center">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 mr-2 border border-gray-300">
                  <img 
                    src={user.avatar || ""} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                    }}
                  />
                </div>
              </Link>
              
              {/* Bouton déconnexion pour desktop */}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
                title="Déconnexion"
              >
                <FaSignOutAlt size={20} />
              </button>
            </div>
          )}
          
          <button onClick={toggleMenu} className='lg:hidden'>
            <svg className="w-7 h-7" fill="#000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"></path>
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
