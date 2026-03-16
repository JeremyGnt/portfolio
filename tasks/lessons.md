# Lessons

- Pour une section GSAP `ScrollTrigger` avec `pin: true`, ne pas cumuler une grande `height` CSS sur le trigger avec une grande distance `end`, sinon on crée un vide après l'animation.
- Quand le rendu attendu est "animation puis footer immédiatement", laisser `ScrollTrigger` gérer l'espace de pinning et garder le wrapper de la scène à une hauteur proche du viewport.
- Pour une interaction "cursor-follow", implementer d'abord l'architecture demandee a l'identique: un seul conteneur `fixed` hors du flux, `pointer-events: none`, pilote par un listener global et `gsap.quickTo()`.
- Ne pas remplacer un comportement principal casse par un fallback inline dans la page tant que la version desktop demandee n'est pas fiable, sinon le bug se masque et le layout se degrade.
