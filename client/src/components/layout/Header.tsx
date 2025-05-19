import { useState } from "react";
import { useLocation } from "wouter";
import UserMenu from "./UserMenu";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [location] = useLocation();
  
  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Accueil";
      case "/operations":
        return "Suivi des Opérations";
      case "/dashboard":
        return "Tableaux de Bord";
      case "/progress":
        return "Suivi des Avancements";
      case "/performance":
        return "Performances";
      case "/safety":
        return "Sécurité & Incidents";
      case "/users":
        return "Gestion des Utilisateurs";
      case "/archives":
        return "Archives";
      default:
        return "OCP Décapage";
    }
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleSidebar}
            className="text-neutral-700"
          >
            <span className="material-icons">menu</span>
          </button>
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1618477440249-d6735b32efe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48"
              alt="OCP Logo"
              className="w-8 h-8 mr-2 rounded"
            />
            <h1 className="text-lg font-semibold text-primary-700">OCP</h1>
          </div>
          <UserMenu mobile />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <h1 className="text-2xl font-bold text-neutral-800">
          {getPageTitle(location)}
        </h1>
      </div>
    </>
  );
}
