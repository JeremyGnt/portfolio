# Lessons

- Pour une section GSAP `ScrollTrigger` avec `pin: true`, ne pas cumuler une grande `height` CSS sur le trigger avec une grande distance `end`, sinon on crée un vide après l'animation.
- Quand le rendu attendu est "animation puis footer immédiatement", laisser `ScrollTrigger` gérer l'espace de pinning et garder le wrapper de la scène à une hauteur proche du viewport.
