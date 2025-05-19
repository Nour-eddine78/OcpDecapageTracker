import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-200">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center">
          <img
            src="https://images.unsplash.com/photo-1618477440249-d6735b32efe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48"
            alt="OCP Logo"
            className="w-10 h-10 mr-2 rounded"
          />
          <div>
            <h1 className="text-lg font-semibold text-primary-700">OCP</h1>
            <p className="text-xs text-neutral-500">Gestion des Décapages</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          <li className="px-2 mb-1">
            <Link href="/">
              <a
                className={`sidebar-link ${
                  location === "/" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">home</span>
                <span>Accueil</span>
              </a>
            </Link>
          </li>
          <li className="px-2 mb-1">
            <Link href="/operations">
              <a
                className={`sidebar-link ${
                  location === "/operations" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">engineering</span>
                <span>Suivi des Opérations</span>
              </a>
            </Link>
          </li>
          <li className="px-2 mb-1">
            <Link href="/dashboard">
              <a
                className={`sidebar-link ${
                  location === "/dashboard" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">dashboard</span>
                <span>Tableaux de Bord</span>
              </a>
            </Link>
          </li>
          <li className="px-2 mb-1">
            <Link href="/progress">
              <a
                className={`sidebar-link ${
                  location === "/progress" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">trending_up</span>
                <span>Suivi des Avancements</span>
              </a>
            </Link>
          </li>
          <li className="px-2 mb-1">
            <Link href="/performance">
              <a
                className={`sidebar-link ${
                  location === "/performance" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">speed</span>
                <span>Performances</span>
              </a>
            </Link>
          </li>
          <li className="px-2 mb-1">
            <Link href="/safety">
              <a
                className={`sidebar-link ${
                  location === "/safety" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">security</span>
                <span>Sécurité & Incidents</span>
              </a>
            </Link>
          </li>
          {user?.role === "admin" && (
            <li className="px-2 mb-1">
              <Link href="/users">
                <a
                  className={`sidebar-link ${
                    location === "/users" ? "active" : ""
                  }`}
                >
                  <span className="material-icons text-xl mr-3">people</span>
                  <span>Utilisateurs</span>
                </a>
              </Link>
            </li>
          )}
          <li className="px-2 mb-1">
            <Link href="/archives">
              <a
                className={`sidebar-link ${
                  location === "/archives" ? "active" : ""
                }`}
              >
                <span className="material-icons text-xl mr-3">storage</span>
                <span>Archives</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
            <span>{user?.name?.slice(0, 2).toUpperCase() || "US"}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">
              {user?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-neutral-500">
              {user?.role === "admin" ? "Administrateur" : "Superviseur"}
            </p>
          </div>
          <button
            onClick={logout}
            className="ml-auto text-neutral-500 hover:text-neutral-700"
          >
            <span className="material-icons text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
