import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VenuesPage from "./pages/VenuesPage";
//import SpecificVenuePage from './pages/SpecificVenuePage';

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
            {/* <Route path="/venues/:id" element={<SpecificVenuePage />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
