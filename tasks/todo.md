# Todo

- [completed] Garantir qu'une navigation vers `/` repositionne toujours la fenêtre en haut de page.
- [completed] Appliquer le correctif au niveau de la navigation globale sans perturber les autres routes.
- [completed] Vérifier le comportement avec un build.
- [completed] Retarder le scroll top de `/` pour laisser le cleanup ScrollTrigger de `/experience` se terminer.
- [completed] Vérifier avec un build que le correctif de transition `/experience` -> `/` reste stable.
- [completed] Forcer une arrivée instantanée en haut de page lors de l'ouverture de `/experience`.
- [completed] Réinitialiser l'état visuel et la position de départ des lettres du logo lors du retour sur `/`.
- [completed] Vérifier le correctif avec un build ciblé.
- [completed] Analyser et refactorer la page `/experience` pour réduire le couplage entre données, rendu et animation.
- [completed] Extraire l'animation GSAP/ScrollTrigger dans un composable dédié en conservant l'apparition séquencée des cards.
- [completed] Simplifier le modèle de données et la structure des composants de la page.
- [completed] Vérifier le résultat avec un build et une revue ciblée du comportement au scroll.
- [completed] Corriger le layout des cards de `/experience` pour garantir 3 tiers visibles sans empilement ni card masquée.
- [completed] Réduire la longueur de scroll de `/experience` pour enchaîner directement sur le footer après les 3 cards.
- [completed] Supprimer la hauteur HTML excédentaire de la scène `/experience` pour éviter le vide avant le footer.
- [completed] Ajuster la hiérarchie visuelle de `/experience` pour garder le titre centré sous les cards et remplacer l'indicateur par la flèche de la landing.
- [completed] Masquer le header pendant le scroll de `/experience` pour libérer de l'espace et agrandir les cards.
- [completed] Remplacer sur `/experience` le masquage du header par un menu compact rond extensible au clic.
- [completed] Refaire l'animation du menu compact de `/experience` pour qu'il se rétracte depuis la gauche et finisse en cercle aligné à droite du header.
- [completed] Choisir une icône d'ouverture/fermeture plus cohérente avec une extension latérale du menu.
- [completed] Vérifier le rendu et le build après ajustement du header et du menu.

# Review

- La page `/experience` est maintenant découpée en un composable d'animation, une vue légère et un composant dédié pour les cards.
- Le reveal séquencé au scroll est conservé via GSAP/ScrollTrigger avec pinning et apparition progressive des cards.
- Le build `npm run build` passe.
- Le layout desktop utilise maintenant trois colonnes réelles, avec des cards plus étroites et un breakpoint mobile repoussé pour éviter l'empilement trop tôt.
- La scène scrollée de `/experience` se termine plus tôt pour laisser apparaître le footer juste après les trois cards.
- La hauteur du wrapper scrollé a été ramenée au viewport pour ne pas ajouter de vide en plus du pinning GSAP.
- Le titre central de `/experience` reste ancré et les cards passent visuellement au-dessus ; l'indicateur de scroll reprend la flèche de la landing.
- Le header reste visible pendant la séquence scrollée de `/experience`, mais son menu se compacte en bouton rond extensible pour libérer de l'espace.
- Le menu du header se compacte maintenant en bouton rond pendant le scroll de `/experience` et peut se déployer proprement au clic.
- Le menu du header sur `/experience` se replie maintenant depuis la gauche dans une seule capsule ancrée à droite, jusqu'à former un vrai cercle ouvrable, avec des icônes `PanelRightOpen` et `PanelRightClose`.
- Le build `npm run build` passe après la refonte.
- L'arrivée sur `/experience` force maintenant un scroll top instantané, sans hériter du `scroll-behavior: smooth` global.
- Le retour sur `/` recale les lettres du logo depuis leur position de départ et nettoie les transforms GSAP résiduelles sur le logo du header.
- Le build `npm run build` passe après ce correctif de navigation.
- Une navigation vers `/` force maintenant aussi un scroll top instantané depuis le watcher global de route, sans dépendre uniquement du montage de la home.
- Le build `npm run build` passe après ce renforcement du comportement de retour sur `/`.
- Le retour de `/experience` vers `/` décale maintenant le reset de scroll après le changement de vue et deux frames, pour éviter qu'un cleanup GSAP/ScrollTrigger ne réapplique l'ancienne position.
- Le build `npm run build` passe après ce correctif ciblé sur la transition `/experience` -> `/`.
