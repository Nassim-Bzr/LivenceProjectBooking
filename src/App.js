import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import AppartementDetails from "./Pages/AppartementDetails";
import AppartementAvis from "./Pages/AppartementAvis";
import CheckoutReservation from "./Pages/CheckoutReservation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// proprietaires pages
import Proprietaires from "./Pages/Proprietaires";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import NotFound from "./Pages/NotFound";
import ForgotPassword from "./Pages/ForgotPassword";
import Profile from "./Pages/Profile";
import Messagerie from "./Pages/Messagerie";
import { AuthProvider } from "./Context/AuthContext";
import AddAppartement from "./Pages/Admin/AddAppartement";
import AdminReservations from "./Pages/Admin/Reservations";
import ClientProfile from "./Pages/Admin/ClientProfile";
// NotFound page


function App() {
  return (
    <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/admin/add-appartement" element={<AddAppartement />} />
                <Route path="/admin/reservations" element={<AdminReservations />} />
                <Route path="/admin/client/:userId" element={<ClientProfile />} />
                <Route path="/" element={<Home />} />
                <Route path="/appartement/:slug" element={<AppartementDetails />} />
                <Route path="/appartement/:slug/avis" element={<AppartementAvis />} />
                <Route path="/appartement/:slug/checkout" element={<CheckoutReservation />} />
                <Route path="/proprietaires" element={<Proprietaires />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messagerie" element={<Messagerie />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
    </AuthProvider>
  );
}

export default App;
