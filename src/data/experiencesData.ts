export type ExperienceSectionIcon = 'briefcase' | 'award' | 'heart-handshake'
export type CertificationIcon = 'database' | 'atom' | 'clipboard-list'
export type CertificationTone = 'violet' | 'blue' | 'orange'

type ExperienceCardBase = {
  id: string
  type: 'experience' | 'certifications' | 'volunteering'
  icon: ExperienceSectionIcon
  number: string
  title: string
}

export type ExperienceTimelineCard = ExperienceCardBase & {
  type: 'experience'
  role: string
  company: string
  date: string
  duration: string
  points: string[]
}

export type ExperienceCertificationItem = {
  id: string
  icon: CertificationIcon
  title: string
  subtitle: string
  date: string
  tone: CertificationTone
}

export type ExperienceCertificationsCard = ExperienceCardBase & {
  type: 'certifications'
  items: ExperienceCertificationItem[]
}

export type ExperienceVolunteeringItem = {
  id: string
  title: string
  role: string
  description: string
  tags: string[]
}

export type ExperienceVolunteeringCard = ExperienceCardBase & {
  type: 'volunteering'
  items: ExperienceVolunteeringItem[]
}

export type ExperienceCard =
  | ExperienceTimelineCard
  | ExperienceCertificationsCard
  | ExperienceVolunteeringCard

export type ExperiencesPageData = {
  hero: {
    title: string
    highlight: string
  }
  cards: ExperienceCard[]
}

export const experiencesPageData: ExperiencesPageData = {
  hero: {
    title: 'Expériences &',
    highlight: 'Certifications',
  },
  cards: [
    {
      id: 'experience',
      type: 'experience',
      icon: 'briefcase',
      number: '01.',
      title: 'Expérience',
      role: 'Stage Ingénieur',
      company: 'Carrefour',
      date: '2026',
      duration: '5 semaines',
      points: [
        'Analyse de données commerciales',
        "Mise en place de logiques d'optimisation",
        'Gestion opérationnelle',
        "Outils numériques pour l'analyse",
        'Aide à la décision basée sur la data',
      ],
    },
    {
      id: 'certifications',
      type: 'certifications',
      icon: 'award',
      number: '02.',
      title: 'Certifications',
      items: [
        {
          id: 'sql',
          icon: 'database',
          title: 'Certification SQL',
          subtitle: 'Liora (ex DataScientest)',
          date: '2024',
          tone: 'violet',
        },
        {
          id: 'nano',
          icon: 'atom',
          title: 'Nanosciences',
          subtitle: 'Domaine de spécialité',
          date: '2026',
          tone: 'blue',
        },
        {
          id: 'project-management',
          icon: 'clipboard-list',
          title: 'Gestion de projet',
          subtitle: 'MOOC',
          date: '2026',
          tone: 'orange',
        },
      ],
    },
    {
      id: 'volunteering',
      type: 'volunteering',
      icon: 'heart-handshake',
      number: '03.',
      title: 'Volontariat',
      items: [
        {
          id: 'recup-gamelles',
          title: 'Récup & Gamelles',
          role: 'Bénévole étudiant',
          description:
            'Association de redistribution alimentaire. Animations et sensibilisations sur le gaspillage.',
          tags: ['Équipe', 'Social', 'Orga'],
        },
        {
          id: 'scouts-guides',
          title: 'Scouts & Guides',
          role: 'Engagement 6 ans',
          description:
            "Développement du leadership, de la gestion de groupe, du sens de l'initiative et de l'autonomie.",
          tags: ['Leadership', 'Autonomie', 'Initiative'],
        },
      ],
    },
  ],
}
