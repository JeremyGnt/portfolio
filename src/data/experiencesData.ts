export type ExperienceSectionIcon = 'briefcase' | 'award' | 'heart-handshake'
export type CertificationIcon = 'database' | 'atom' | 'clipboard-list'

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
  number: string
  sectionTitle: string
  theme: ExperienceTheme
  experience?: {
    role: string
    company: string
    badge: string
    date: string
    duration: string
    points: string[]
  }
  certifications?: {
    items: Array<{
      id: string
      icon: CertificationIcon
      title: string
      subtitle: string
      date: string
      iconClass: string
      boxClass: string
    }>
  }
  volunteering?: {
    items: Array<{
      id: string
      title: string
      role: string
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
    kicker: 'Mon Parcours',
    title: 'Expériences &',
    highlight: 'Certifications',
  },
  cards: [
    {
      id: 'experience',
      type: 'experience',
      icon: 'briefcase',
      number: '01.',
      sectionTitle: 'EXPÉRIENCE',
      theme: {
        titleClass: 'theme-experience-title',
        iconClass: 'theme-experience-icon',
        cardClass: 'theme-experience-card',
      },
      experience: {
        role: 'Stage Ingénieur',
        company: 'Carrefour',
        badge: 'Stage',
        date: '2026',
        duration: '5 semaines',
        points: [
          'Analyse de données commerciales',
          'Mise en place de logiques d\'optimisation',
          'Gestion opérationnelle',
          'Outils numériques pour l\'analyse',
          'Aide à la décision basée sur la data',
        ],
      },
    },
    {
      id: 'certifications',
      type: 'certifications',
      icon: 'award',
      number: '02.',
      sectionTitle: 'CERTIFICATIONS',
      theme: {
        titleClass: 'theme-certifications-title',
        iconClass: 'theme-certifications-icon text-white',
        cardClass: 'theme-certifications-card',
      },
      certifications: {
        items: [
          {
            id: 'sql',
            icon: 'database',
            title: 'Certification SQL',
            subtitle: 'Liora (ex DataScientest)',
            date: '2024',
            iconClass: 'cert-icon-purple',
            boxClass: 'cert-box-purple',
          },
          {
            id: 'nano',
            icon: 'atom',
            title: 'Nanosciences',
            subtitle: 'Domaine de spécialité',
            date: '2026',
            iconClass: 'cert-icon-blue',
            boxClass: 'cert-box-blue',
          },
          {
            id: 'project-management',
            icon: 'clipboard-list',
            title: 'Gestion de projet',
            subtitle: 'MOOC validé',
            date: '2026',
            iconClass: 'cert-icon-orange',
            boxClass: 'cert-box-orange',
          },
        ],
      },
    },
    {
      id: 'volunteering',
      type: 'volunteering',
      icon: 'heart-handshake',
      number: '03.',
      sectionTitle: 'VOLONTARIAT',
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
              'Six années d\'engagement développant le leadership, la gestion de groupe et l\'initiative.',
            tags: ['Leadership', 'Autonomie', 'Initiative'],
          },
        ],
      },
    },
  ],
}
