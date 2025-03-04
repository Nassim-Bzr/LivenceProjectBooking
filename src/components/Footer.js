export default function Footer() {
    return (
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} BookingApp. Tous droits réservés.
          </p>
          <p className="text-xs mt-2">
            Conçu avec ❤️ par ton dev bg.
          </p>
        </div>
      </footer>
    );
  }
  