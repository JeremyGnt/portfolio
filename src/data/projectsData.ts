export interface ProjectData {
  id: string
  year: number
  title: string
  category: string
  listTags: string[]
  description: string
  badges: string[]
  imageSrc?: string
  imageAlt?: string
  externalUrl?: string
}

export const projectsData: ProjectData[] = [
  {
    id: 'drawbot',
    year: 2025,
    title: 'Drawbot autonome',
    category: 'Robotique mobile',
    listTags: ['ESP32', 'PID'],
    description: 'Robot mobile autonome dessinant des formes géométriques à l’aide d’un contrôle PID, d’encodeurs moteurs, d’une IMU et d’un magnétomètre.',
    badges: ['ESP32', 'PID', 'IMU', 'Magnetometre'],
    imageSrc: '/projects/projet_drawbots.webp',
    imageAlt: 'Photo du robot Drawbot autonome',
  },
  {
    id: 'airbnb-for-students',
    year: 2025,
    title: 'Airbnb for Students',
    category: 'Plateforme web',
    listTags: ['JS', 'PHP'],
    description: 'Plateforme web inspirée d’Airbnb pour étudiants avec recherche de logements, favoris, avis utilisateurs et base de données relationnelle.',
    badges: ['HTML', 'CSS', 'JS', 'PHP', 'SQL'],
    imageSrc: '/projects/projet_omnesbnb.webp',
    imageAlt: 'Capture du projet Omnes BnB de plateforme web pour etudiants',
    externalUrl: 'https://github.com/JeremyGnt/OmnesBnb',
  },
  {
    id: 'fruit-ninja-fpga',
    year: 2024,
    title: 'Fruit Ninja FPGA',
    category: 'Systeme embarque interactif',
    listTags: ['VHDL', 'FPGA'],
    description: 'Jeu Fruit Ninja sur FPGA piloté par capteur ultrason avec détection de mouvement, calcul de trajectoire, collision en temps réel et système de score.',
    badges: ['FPGA', 'VHDL', 'Capteur ultrason'],
    imageSrc: '/projects/projet_fruitninja.webp',
    imageAlt: 'Photo du projet Fruit Ninja FPGA',
  },
  {
    id: 'programmable-controller',
    year: 2023,
    title: 'Manette programmable',
    category: 'Interface hardware',
    listTags: ['C++', 'ATTiny'],
    description: 'Développement d’une manette de jeu basée sur microcontrôleur ATTiny avec écran OLED et interface de contrôle personnalisée.',
    badges: ['C++', 'ATTiny', 'OLED', 'UI embarquee'],
    imageSrc: '/projects/projet_manette.webp',
    imageAlt: 'Photo de la manette programmable avec son interface embarquee',
  },
  {
    id: 'overcooked-multiplayer',
    year: 2024,
    title: 'Overcooked multijoueur',
    category: 'Jeu cooperatif',
    listTags: ['C', 'Allegro 5'],
    description: 'Jeu multijoueur inspiré d’Overcooked avec interface graphique Allegro 5 et programmation système avancée.',
    badges: ['C', 'Allegro 5', 'Gameplay', 'Systeme'],
    imageSrc: '/projects/projet_escooked.webp',
    imageAlt: 'Capture du jeu cooperatif Overcooked multijoueur',
    externalUrl: 'https://github.com/JeremyGnt/EsCooked',
  },
  {
    id: 'alarm-clock',
    year: 2024,
    title: 'Reveil electronique',
    category: 'Objet embarque',
    listTags: ['C++', 'Microcontroleur'],
    description: 'Création d’un réveil électronique programmable avec logique d’alarme, gestion du temps et programme embarqué sur microcontrôleur.',
    badges: ['C++', 'Microcontroleur', 'Temps reel'],
    imageSrc: '/projects/projet_reveil.webp',
    imageAlt: 'Photo du reveil electronique programme',
  },
  {
    id: 'food-web-simulation',
    year: 2025,
    title: 'Simulation trophique',
    category: 'Simulation scientifique',
    listTags: ['Python', 'Modelisation'],
    description: 'Application de simulation de réseaux trophiques pour étudier les interactions entre espèces et la dynamique d’un écosystème.',
    badges: ['Python', 'Simulation', 'Modelisation'],
    imageSrc: '/projects/projet_simulation.webp',
    imageAlt: 'Capture de la simulation scientifique de reseaux trophiques',
    externalUrl: 'https://github.com/JeremyGnt/reseaux-trophiques',
  },
  {
    id: 'snoopy-console-game',
    year: 2023,
    title: 'Jeu console : Snoopy',
    category: 'Jeu console en C',
    listTags: ['C', 'Console'],
    description: 'Jeu console en C inspiré de Snoopy, avec plusieurs niveaux et un menu interactif. Gestion des collisions, du score, du temps et de mécaniques.',
    badges: ['C', 'Algorithmique', 'Interface console'],
    imageSrc: '/projects/projet_snoopy.webp',
    imageAlt: 'Capture du jeu console inspire de Snoopy',
    externalUrl: 'https://github.com/JeremyGnt/Snoopy',
  },
]
