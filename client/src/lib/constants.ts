// Machine types and methods
export const DECAPAGE_METHODS = [
  { id: "Transport", name: "Transport", machines: "Transwine, Procaneq" },
  { id: "Poussage", name: "Poussage", machines: "D11" },
  { id: "Casement", name: "Casement", machines: "750011, 750012, PH1, PH2, 200B1, Libhere" }
];

// Machine status options
export const MACHINE_STATUS = [
  { id: "En service", name: "En service", color: "green" },
  { id: "Maintenance", name: "Maintenance", color: "yellow" },
  { id: "Hors service", name: "Hors service", color: "red" }
];

// Postes (shifts)
export const POSTES = [
  { id: "1", name: "Poste 1" },
  { id: "2", name: "Poste 2" },
  { id: "3", name: "Poste 3" }
];

// Machine states
export const MACHINE_STATES = [
  { id: "marche", name: "En marche" },
  { id: "arret", name: "À l'arrêt" }
];

// Safety incident types
export const INCIDENT_TYPES = [
  { id: "HSE", name: "Hygiène, Sécurité, Environnement" },
  { id: "Technique", name: "Problème Technique" },
  { id: "Autre", name: "Autre" }
];

// Safety incident severity levels
export const INCIDENT_SEVERITY = [
  { id: "Bas", name: "Bas", color: "green" },
  { id: "Moyen", name: "Moyen", color: "yellow" },
  { id: "Élevé", name: "Élevé", color: "orange" },
  { id: "Critique", name: "Critique", color: "red" }
];

// Safety incident status
export const INCIDENT_STATUS = [
  { id: "Ouvert", name: "Ouvert", color: "red" },
  { id: "En cours", name: "En cours", color: "yellow" },
  { id: "Résolu", name: "Résolu", color: "green" }
];

// User roles
export const USER_ROLES = [
  { id: "admin", name: "Administrateur" },
  { id: "supervisor", name: "Superviseur" }
];

// Time ranges for statistics
export const TIME_RANGES = [
  { id: "week", name: "Semaine" },
  { id: "month", name: "Mois" },
  { id: "quarter", name: "Trimestre" },
  { id: "year", name: "Année" }
];

// Document types
export const DOCUMENT_TYPES = [
  {
    icon: "description",
    title: "Procédures d'opération standard",
    description: "Protocoles et directives pour les opérations de décapage.",
    actionIcon: "file_download",
    actionText: "Télécharger PDF"
  },
  {
    icon: "video_library",
    title: "Vidéos de formation",
    description: "Tutoriels vidéo pour l'utilisation optimale des machines.",
    actionIcon: "play_circle_outline",
    actionText: "Voir la bibliothèque"
  },
  {
    icon: "rule",
    title: "Normes HSE",
    description: "Règles et procédures de sécurité pour les opérations de terrain.",
    actionIcon: "file_download",
    actionText: "Télécharger PDF"
  },
  {
    icon: "build",
    title: "Manuels techniques",
    description: "Spécifications et guides d'entretien des équipements.",
    actionIcon: "folder_open",
    actionText: "Parcourir les manuels"
  }
];

// Method images
export const METHOD_IMAGES = {
  Transport: "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
  Poussage: "https://pixabay.com/get/g972a57b06a3693399d103113ae0b127168ff248d203f9da8892ab1f13ae897001926468d19cfd8307cf7910f0bab8761febcb0d1a72445071768bf7e660c9d46_1280.jpg",
  Casement: "https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
};
