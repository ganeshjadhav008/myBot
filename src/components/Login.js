import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.svg';

export default function Login() {

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [allowedEmails, setAllowedEmails] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('/emails.json')
      .then((response) => response.json())
      .then((data) => setAllowedEmails(data.allowedEmails))
      .catch((err) => console.error("Error fetching emails:", err));
  }, []);

  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      navigate('/bot');
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      setError("User already exists!");
      navigate('/bot');
      return;
    }

    if (!allowedEmails.includes(email)) {
      setError("Email is not authorized to login.");
      return;
    }


    const token = Math.random().toString(36).substring(2);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    navigate('/bot');
  };

  return (
    <div className="d-flex align-items-center justify-content-center full-height">
      <main className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <img src={logo} alt="Logo" className="enf-logo" />
            <div className="cards">
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Get a free ChatBot</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter your email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type="submit" className="btn continue btn-success w-100">Continue</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
