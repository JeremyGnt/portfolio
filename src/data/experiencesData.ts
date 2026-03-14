export type ExperienceSectionIcon = 'briefcase' | 'award' | 'heart-handshake'

export type ExperienceTheme = {
  titleClass: string
  iconClass: string
  cardClass: string
}

export type ExperienceCardType = 'experience' | 'certifications' | 'volunteering'

export type ExperienceCard = {
  id: string
  type: ExperienceCardType
  icon: ExperienceSectionIcon
  sectionTitle: string
  theme: ExperienceTheme
  experience?: {
    role: string
    subtitle: string
    badge: string
    points: string[]
  }
  certifications?: {
    items: Array<{
      id: string
      icon: string
      title: string
      subtitle: string
    }>
  }
  volunteering?: {
    items: Array<{
      id: string
      title: string
      subtitle: string
      description: string
      tags: string[]
    }>
  }
}

export type ExperiencesPageData = {
  hero: {
    kicker: string
    title: string
    highlight: string
  }
  cards: ExperienceCard[]
}

export const experiencesPageData: ExperiencesPageData = {
  hero: {
    kicker: 'Parcours',
    title: 'Expériences',
    highlight: '& Certifications',
  },
  cards: [
    {
      id: 'experience',
      type: 'experience',
      icon: 'briefcase',
      sectionTitle: 'Expérience professionnelle',
      theme: {
        titleClass: 'theme-experience-title',
        iconClass: 'theme-experience-icon',
        cardClass: 'theme-experience-card',
      },
      experience: {
        role: 'Stage Ingénieur — Carrefour',
        subtitle: 'Stage 5 semaines · 2026',
        badge: 'Stage',
        points: [
          'Analyse de données commerciales',
          'Mise en place de logiques d\'optimisation',
          'Gestion opérationnelle',
          'Utilisation d\'outils numériques pour l\'analyse',
          'Aide à la prise de décision basée sur les données',
        ],
      },
    },
    {
      id: 'certifications',
      type: 'certifications',
      icon: 'award',
      sectionTitle: 'Certifications',
      theme: {
        titleClass: 'theme-certifications-title',
        iconClass: 'theme-certifications-icon',
        cardClass: 'theme-certifications-card',
      },
      certifications: {
        items: [
          {
            id: 'sql',
            icon: '🗄️',
            title: 'Certification SQL',
            subtitle: 'Liora (ex DataScientest) · 2024',
          },
          {
            id: 'nano',
            icon: '⚛️',
            title: 'Certification Nanosciences',
            subtitle: '2026',
          },
          {
            id: 'mooc',
            icon: '📋',
            title: 'MOOC Gestion de Projet',
            subtitle: '2026',
          },
        ],
      },
    },
    {
      id: 'volunteering',
      type: 'volunteering',
      icon: 'heart-handshake',
      sectionTitle: 'Volontariat',
      theme: {
        titleClass: 'theme-volunteering-title',
        iconClass: 'theme-volunteering-icon',
        cardClass: 'theme-volunteering-card',
      },
      volunteering: {
        items: [
          {
            id: 'recup-gamelles',
            title: 'Récup & Gamelles',
            subtitle: 'Bénévole étudiant',
            description:
              'Association de redistribution alimentaire. Animations et sensibilisations sur le gaspillage alimentaire, collecte d\'invendus, préparation de repas à coût réduit.',
            tags: ['Travail d\'équipe', 'Engagement social', 'Organisation', 'Responsabilité'],
          },
          {
            id: 'scouts',
            title: 'Scouts et Guides de France',
            subtitle: 'Engagement 6 ans',
            description:
              'Six années d\'engagement au sein des Scouts et Guides de France, développant leadership, gestion de groupe et sens de l\'initiative.',
            tags: ['Leadership', 'Gestion de groupe', 'Autonomie', 'Initiative'],
          },
        ],
      },
    },
  ],
}
