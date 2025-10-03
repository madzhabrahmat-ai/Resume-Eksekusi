
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-blue-600">
          Generator Resume Eksekusi
        </h1>
        <p className="text-sm text-slate-500">
          Pengadilan Negeri Bandung Kelas I A Khusus
        </p>
      </div>
    </header>
  );
};

export default Header;
