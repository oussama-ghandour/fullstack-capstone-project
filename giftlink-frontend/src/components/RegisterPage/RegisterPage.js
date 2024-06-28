import React, { useState } from "react";
import './RegisterPage.css';
import {urlConfig} from '../../config';
import { useAppContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {


    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shower, setShower] = useState('');

    const navigate = useNavigate();
    const {setIsLoggedIn} = useAppContext();

   const handleRegister = async () => {
            try {
                const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: password
                    })
                });
                const json = await response.json();
                console.log('json data', json);
                console.log('er', json.error);
                if (json.authtoken) {
                    sessionStorage.setItem('auth-token', json.authtoken);
                    sessionStorage.setItem('name', firstName);
                    sessionStorage.setItem('email', json.email);
                    setIsLoggedIn(true);
                    navigate('/app');
                }
                if (json.error) {
                    setShower(json.error);
                }
            } catch (e) {
                console.log("Error fetching details: " + e.message);
            }
        }
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="register-card p-4 border rounded">
                    <div className="text-center mb-4 font-weight-bold">
                        <div className="mb-4">
                            <label  htmlFor="firstName" className="form label">First Name</label>
                              <input
                                id="firstName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                />
                        </div>
                         <div className="mb-4">
                            <label  htmlFor="lastName" className="form label">Last Name</label>
                              <input
                                id="lastName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                />
                        </div>
                         <div className="mb-4">
                            <label  htmlFor="email" className="form label">Email</label>
                              <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="text-danger">{shower}</div>
                        </div>
                         <div className="mb-4">
                            <label  htmlFor="password" className="form label">Password</label>
                              <input
                                id="password"
                                type="text"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                />
                        </div>
                            <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>Register</button>
                        <p>
                            Already a memeber? <a href="/app/login" className="text-primary">Login</a>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RegisterPage;