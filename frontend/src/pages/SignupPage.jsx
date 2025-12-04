import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard.jsx';

export default function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try { await signup(form); nav('/chat'); }
    catch (err) { setError(err?.response?.data?.message || 'Signup failed'); }
  };

  return (
    <AuthCard title="Create account">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Username</label>
          <input className="input" value={form.username} onChange={e=>setForm({ ...form, username: e.target.value })} placeholder="yourname" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <button className="btn-primary w-full">Sign up</button>
        <div className="small">Have an account? <Link to="/login" className="text-indigo-600">Login</Link></div>
      </form>
    </AuthCard>
  );
}
