export default function Footer() {
    return (
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Livence. Tous droits réservés.
          </p>
      
        </div>
      </footer>
    );
  }
  