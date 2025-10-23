import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import AdminDashboard from './pages/AdminDashboard';
import AdminChat from './pages/AdminChat';
import Login from './pages/Login';
import './App.css';

function App() {
  const onLogin = (token) => {
    localStorage.setItem('admin_token', token);
    window.location.href = '/admin';
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
  <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/chat" element={<AdminChat />} />
      </Routes>
      <Footer />
      <ChatWidget />
    </Router>
  );
}

export default App;
