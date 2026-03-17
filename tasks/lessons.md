# Lessons

- Pour une section GSAP `ScrollTrigger` avec `pin: true`, ne pas cumuler une grande `height` CSS sur le trigger avec une grande distance `end`, sinon on crée un vide après l'animation.
- Quand le rendu attendu est "animation puis footer immédiatement", laisser `ScrollTrigger` gérer l'espace de pinning et garder le wrapper de la scène à une hauteur proche du viewport.
- Pour une interaction "cursor-follow", implementer d'abord l'architecture demandee a l'identique: un seul conteneur `fixed` hors du flux, `pointer-events: none`, pilote par un listener global et `gsap.quickTo()`.
- Ne pas remplacer un comportement principal casse par un fallback inline dans la page tant que la version desktop demandee n'est pas fiable, sinon le bug se masque et le layout se degrade.
- Quand le brief demande quelque chose de tres simple et dans le style de la landing, repartir du langage visuel existant et couper la copy au minimum avant d'ajouter une mise en scene plus forte.
- Sur le background global de ce portfolio, eviter des cards trop opaques ou des ombres trop denses qui fabriquent un bandeau sombre derriere le rail et cassent la continuite avec la page.
- Pour une section horizontale avec texte ancre, declencher le `pin` au niveau reel du header fixe et retirer les translations verticales des elements scrolles pour que l'effet horizontal demarre immediatement.
- Si la section doit se lire comme un hero centre, centrer la scene par le layout lui-meme et ne pas la descendre artificiellement avec un `start` compense par le header.
- Sur un rail horizontal coupe par le viewport, utiliser un `mask-image` en fondu sur desktop plutot qu'un clipping net si le rendu attendu est fluide et premium.
- Sur une vue hero scrollable de ce projet, neutraliser le `padding-top` global de `.page` sinon un petit scroll parasite apparait avant le pin et casse le demarrage immediat de l'animation.
- Eviter de placer un trigger `ScrollTrigger` avec `pin` dans un parent `display: flex`, sinon le spacer peut mal reserver l'espace de scroll et la section tombe trop vite sur le footer.
- Si les cards doivent etre opaques, retirer la transparence et le blur du fond au lieu de conserver un effet glass trop leger qui laisse voir le background.
- Si un `hover` CSS doit appliquer un `scale`, ne pas laisser GSAP poser un `transform` inline via `force3D` sur le meme element, sinon l'effet visuel disparait.
