import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export const CandidateLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const RecruiterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
