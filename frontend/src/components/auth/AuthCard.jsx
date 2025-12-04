import React from 'react';

export default function AuthCard({ title, children }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="w-[420px] bg-white rounded-xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
}
