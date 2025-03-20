import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import AppartementDetails from "./Pages/AppartementDetails";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// proprietaires pages
import Proprietaires from "./Pages/Proprietaires";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import NotFound from "./Pages/NotFound";
import ForgotPassword from "./Pages/ForgotPassword";
import Profile from "./Pages/Profile";
import { AuthProvider } from "./Context/AuthContext";
// NotFound page


function App() {
  return (
    <AuthProvider>

    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/appartement/:slug" element={<AppartementDetails />} />
            <Route path="/proprietaires" element={< Proprietaires />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
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
