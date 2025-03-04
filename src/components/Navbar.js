import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-[#2545ED] text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold ">
          Livence
        </Link>
        <nav className="flex gap-48">
          <Link to="/" className="font-bold hover:text-cyan-400">
            Accueil
          </Link>
          <Link to="/reservation" className="font-bold hover:text-cyan-400">
            Réserver
          </Link>
          <Link to="/proprietaires" className="font-bold hover:text-cyan-400">
            Propriétaires
          </Link>
          <Link to="/login" className="font-bold hover:text-cyan-400">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}
