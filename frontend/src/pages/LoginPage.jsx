import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav('/chat'); }
    catch (err) { setError(err?.response?.data?.message || 'Login failed'); }
  };

  return (
    <AuthCard title="Sign in">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn-primary w-full">Login</button>
        <div className="small">No account? <Link to="/signup" className="text-indigo-600">Create one</Link></div>
      </form>
    </AuthCard>
  );
}
