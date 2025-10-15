import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BookAppointment from "./AppointmentBooking";
import MyAppointments from "./MyAppointment";
import "./App.css";

function App() {
  return (
    <Router basename="/Appointmentfrontend">
      <div className="App">
        <nav className="navbar">
          <Link to="/">Book</Link>
          <Link to="/my-appointments">My Appointments</Link>
        </nav>

        <Routes>
          <Route path="/" element={<BookAppointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
