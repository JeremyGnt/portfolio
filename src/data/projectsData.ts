export interface ProjectData {
  id: string
  year: number
  title: string
  category: string
  listTags: string[]
  description: string
  badges: string[]
}

export const projectsData: ProjectData[] = [
  {
    id: 'drawbot',
    year: 2025,
    title: 'Drawbot autonome',
    category: 'Robotique mobile',
    listTags: ['ESP32', 'PID'],
    description: 'Robot mobile autonome dessinant des formes geometriques a l aide d un controle PID, d encodeurs moteurs, d une IMU et d un magnetometre.',
    badges: ['ESP32', 'PID', 'IMU', 'Magnetometre'],
  },
  {
    id: 'airbnb-for-students',
    year: 2025,
    title: 'Airbnb for Students',
    category: 'Plateforme web',
    listTags: ['JavaScript', 'PHP'],
    description: 'Plateforme web inspiree d Airbnb pour etudiants avec recherche de logements, favoris, avis utilisateurs et base de donnees relationnelle.',
    badges: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
  },
  {
    id: 'fruit-ninja-fpga',
    year: 2024,
    title: 'Fruit Ninja FPGA',
    category: 'Systeme embarque interactif',
    listTags: ['VHDL', 'FPGA'],
    description: 'Jeu Fruit Ninja sur FPGA pilote par capteur ultrason avec detection de mouvement, calcul de trajectoire, collision en temps reel et systeme de score.',
    badges: ['FPGA', 'VHDL', 'Capteur ultrason', 'Temps reel'],
  },
  {
    id: 'programmable-controller',
    year: 2024,
    title: 'Manette programmable',
    category: 'Interface hardware',
    listTags: ['C++', 'ATTiny'],
    description: 'Developpement d une manette de jeu basee sur microcontroleur ATTiny avec ecran OLED et interface de controle personnalisee.',
    badges: ['C++', 'ATTiny', 'OLED', 'UI embarquee'],
  },
  {
    id: 'overcooked-multiplayer',
    year: 2024,
    title: 'Overcooked multijoueur',
    category: 'Jeu cooperatif',
    listTags: ['C', 'Allegro 5'],
    description: 'Jeu multijoueur inspire d Overcooked avec interface graphique Allegro 5 et programmation systeme avancee.',
    badges: ['C', 'Allegro 5', 'Gameplay', 'Systeme'],
  },
  {
    id: 'alarm-clock',
    year: 2024,
    title: 'Reveil electronique',
    category: 'Objet embarque',
    listTags: ['C++', 'Microcontroleur'],
    description: 'Creation d un reveil electronique programmable avec logique d alarme, gestion du temps et programme embarque sur microcontroleur.',
    badges: ['C++', 'Microcontroleur', 'Temps reel', 'Programmation embarquee'],
  },
  {
    id: 'food-web-simulation',
    year: 2024,
    title: 'Simulation trophique',
    category: 'Simulation scientifique',
    listTags: ['Python', 'Modelisation'],
    description: 'Application de simulation de reseaux trophiques pour etudier les interactions entre especes et la dynamique d un ecosysteme.',
    badges: ['Python', 'Simulation', 'Modelisation', 'Ecosystemes'],
  },
]
