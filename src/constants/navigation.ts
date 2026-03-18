import type { Component } from 'vue'
import {
  Briefcase,
  Folder,
  Mail,
  UserRound,
} from 'lucide-vue-next'

export type NavigationItem = {
  text: string
  path: string
  icon: Component
}

export const navigationItems: NavigationItem[] = [
  { text: 'À propos', path: '/', icon: UserRound },
  { text: 'Expériences', path: '/experience', icon: Briefcase },
  { text: 'Projets', path: '/projects', icon: Folder },
  { text: 'Contact', path: '/contact', icon: Mail },
]

export function getNavigationIndexByPath(path: string) {
  const index = navigationItems.findIndex((item) => item.path === path)
  return Math.max(index, 0)
}
