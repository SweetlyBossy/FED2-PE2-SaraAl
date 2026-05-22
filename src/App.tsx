import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VenuesPage from "./pages/VenuesPage";
import SpecificVenuePage from './pages/SpecificVenuePage';
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import BecomeHostPage from "./pages/BecomeHostPage";
import VenueManagerDashboard from "./pages/VenueManagerDashboard";
import CreateVenuePage from "./pages/CreateVenuePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-900">
        <Header />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/venues/:id" element={<SpecificVenuePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/become-host" element={<BecomeHostPage />} />
            <Route path="/dashboard" element={<VenueManagerDashboard />} />
            <Route path="/create-venue" element={<CreateVenuePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
