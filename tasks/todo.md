# Todo

## Experience Mobile Browser Reliability

- [completed] Reprendre `/experience` mobile pour supprimer la dependance au pin/scrub GSAP sur navigateur mobile et definir un empilement natif fiable.
- [completed] Adapter la nav mobile avec un fallback glass coherent sur vrai Safari/Chrome mobile au lieu de dependre du filtre SVG de distortion.
- [completed] Verifier avec `npm run build` et documenter le resultat de cette refonte mobile.

### Outcome

- La variante mobile de `/experience` n'utilise plus le reveal `ScrollTrigger` pince en mobile: elle repose maintenant sur un empilement natif `position: sticky` avec offsets mesures en JavaScript, ce qui evite les disparitions, coupes et positions incoherentes observees sur Safari et Chrome reels.
- Les offsets mobiles des cards sont calcules a partir de la hauteur du header et des headers de cards, et la scene reserve maintenant aussi l'espace necessaire sous la troisieme card avant l'arrivee du footer.
- Les cards mobiles ont ete compactees pour mieux rentrer dans le viewport reel au-dessus de la bottom nav, sans depender d'un scroll interne fragile.
- La bottom nav mobile et le badge `JG` utilisent maintenant un fallback glass base sur `blur/saturate` au lieu du filtre SVG de distortion desktop, afin d'avoir un rendu stable sur navigateur mobile reel.
- `npm run build` passe apres cette refonte.

## Experience Mobile Stacked Scroll

- [completed] Auditer la scene `/experience` mobile et definir les offsets d'arret des cards sous le header compact et sous les titres precedents.
- [completed] Adapter le layout mobile et le composable GSAP pour faire monter les cards 1, 2 et 3 l'une apres l'autre avec scroll continu sur toute la surface.
- [completed] Verifier l'ajustement avec `npm run build` et documenter le resultat.

### Outcome

- La scene `/experience` conserve le reveal desktop existant, mais passe maintenant sur mobile a un empilement sequentiel: chaque card part du bas, monte avec le scroll et s'arrete a une position calculee sous le header puis sous le header visible de la card precedente.
- Les positions finales mobiles sont mesurees a partir de la hauteur reelle du header fixe et du bloc titre de chaque card, ce qui aligne la card 2 sous le titre de la card 1 puis la card 3 sous celui de la card 2 au lieu de les faire converger au meme niveau.
- Le scroll vertical sur mobile n'est plus capte par un scroll interne dans la card: un geste sur la card ou sur le fond continue de piloter la scene scrollée.
- `npm run build` passe apres ce changement.

## Liquid Menu Mobile Rebase

- [completed] Reprendre la capsule `LiquidMenu` d'origine comme navbar unique au lieu d'une navigation mobile separee.
- [completed] Ajouter uniquement les ajustements mobiles demandes sur ce menu de base: texte sous les icones et bulle draggable sur mobile.
- [completed] Nettoyer le code obsolete de l'ancienne bottom bar mobile et verifier le resultat avec `npm run build`.

### Outcome

- Le site reutilise maintenant `src/components/LiquidMenu.vue` comme seule barre de navigation, sur desktop comme sur mobile.
- En mobile, les items du menu gardent la capsule liquid d'origine mais affichent desormais l'icone au-dessus du texte.
- La bulle active du menu de base peut maintenant etre draguee horizontalement sur mobile; au relachement elle se recale sur l'item vise et active la route correspondante.
- Le composant `src/components/MobileTabBar.vue` a ete retire pour revenir a une architecture plus simple et plus proche du menu initial.
- Le build `npm run build` passe apres ce recentrage sur le menu de base.

## Responsive Mobile iOS Tab Bar

- [completed] Auditer la navigation globale existante, les contraintes du logo header et les dependances GSAP deja en place pour definir une separation desktop/mobile propre.
- [completed] Extraire un modele de navigation partage, conserver `LiquidMenu` pour le desktop et ajouter une barre mobile bottom tab glassmorphism avec icones Lucide et bulle draggable pilotée par `pointer` + GSAP.
- [completed] Recomposer le shell global pour garder le brand `JG` fixe en haut a gauche sur mobile, reserver le bottom tab bar aux ecrans `<= 768px` et neutraliser l'ancrage du logo desktop sur la home en mobile.
- [completed] Verifier la refonte avec `npm run build` et une revue ciblee des breakpoints, de la synchro de route et du comportement de snap de la bulle.

### Outcome

- Le header garde maintenant le `LiquidMenu` existant en desktop, tandis qu'un composant dedie `src/components/MobileTabBar.vue` prend le relais en mobile avec une vraie bottom tab bar iOS-like centree, glassmorphism et `touch-action: none`.
- La bulle mobile suit horizontalement le doigt pendant le drag, calcule l'item courant sous le pointeur, puis snappe avec GSAP `power3.out` vers l'onglet relache avant d'activer la route correspondante.
- Le brand `JG` mobile reste fixe en haut a gauche via un badge dedie, et la home evite maintenant le conflit avec l'ancien logo 3D de header en reaffichant les lettres du hero et en desactivant l'ancrage desktop sous `768px`.
- Le build `npm run build` passe apres cette refonte responsive du systeme de navigation.

## Repository Cleanup

- [completed] Auditer la structure du depot pour distinguer les artefacts generes, les dependances orphelines et les fichiers source non references.
- [completed] Supprimer les elements clairement inutiles du depot sans casser le flux de build.
- [completed] Verifier le nettoyage avec `npm run build` et un controle git final.

### Outcome

- `src/typescript.svg`, reliquat du starter Vite non reference nulle part dans l'application, a ete supprime.
- Les dependances `@fontsource/inter` et `opentype.js` ont ete retirees de `package.json` et `package-lock.json`: elles n'etaient plus utilisees dans le code actuel.
- Le script `font:generate` a ete retire de `package.json` car il pointait vers `scripts/generate-typeface-json.mjs`, fichier absent du depot.
- `npm run build` passe apres ce nettoyage; `dist` a ensuite ete retire pour laisser le depot sans artefacts generes.

## Header Logo Route Spin Reliability

- [completed] Inspecter le watcher de route du logo 3D pour comprendre pourquoi la rotation de transition saute parfois en quittant `/`.
- [completed] Forcer l'animation de changement de page pour les navigations qui partent de la landing, meme apres scroll sur `/`.
- [completed] Verifier le correctif avec `npm run build` et une revue ciblee du flux `/` -> pages internes.

### Outcome

- La rotation de transition du logo 3D n'est plus reservee aux departs depuis le haut de page: une navigation qui part de `/` declenche maintenant aussi l'animation apres scroll sur la landing.
- Les autres routes conservent la garde existante `near top`, ce qui evite d'introduire des spins de changement de page en plein milieu d'une page interne.
- Le build `npm run build` passe apres ce correctif cible.

## Image Optimization

- [completed] Auditer les images servies par le site et identifier les assets vraiment lourds.
- [completed] Generer des versions optimisées pour le web et mettre a jour les references du site.
- [completed] Verifier le changement avec `npm run build` et relever les gains de poids.

### Outcome

- Un script reproductible `npm run images:optimize` optimise maintenant les assets raster utiles du site vers des versions WebP adaptees a leur taille d'affichage.
- Les images projet lourdes et le logo Carrefour referencent maintenant leurs versions optimisees, avec `loading=\"lazy\"` et `decoding=\"async\"` sur les rendus concernes.
- Les cinq assets convertis et utilises passent de 3.06 MB a 282.7 KB, soit 2.78 MB economises et 91.0% de reduction.
- `projet_snoopy.png` a ete conserve en PNG, car sa version WebP etait legerement plus lourde.

## Projects Card Dynamic Height

- [completed] Inspecter les contraintes de hauteur et d'ordre des blocs dans la mini card `/projects`.
- [completed] Deplacer l'image en bas de la card et retirer les limites qui tronquent le texte.
- [completed] Verifier le changement avec `npm run build`.

### Outcome

- La mini card de `/projects` affiche maintenant le texte et les hardskills avant le visuel, avec l'image placee en bas de la card.
- La description n'est plus tronquee par un `line-clamp`, et la floating card n'a plus de hauteur fixe, ce qui laisse la card grandir selon son contenu.
- Le build `npm run build` passe apres cet ajustement de layout.

## Projects Card Images

- [completed] Inspecter les images ajoutees dans `public/projects` et les faire correspondre aux projets existants.
- [completed] Integrer les visuels dans la mini card `/projects` avec un cadrage propre et un fallback propre pour les projets sans image.
- [completed] Verifier le changement avec `npm run build`.

### Outcome

- Les mini cards de `/projects` supportent maintenant un visuel projet directement depuis `public/projects`, avec mapping declare dans `src/data/projectsData.ts`.
- Les images disponibles sont integrees dans un bloc media a ratio stable avec `object-fit: cover`, pour un cadrage propre dans la card sans deformation.
- Les projets sans image conservent un fallback discret afin de ne pas casser la mise en page.
- Le build `npm run build` passe apres cette integration.

## Projects Card Description Width

- [completed] Inspecter la preview card de `/projects` et identifier pourquoi la description n'utilise pas la largeur disponible.
- [completed] Ajuster les styles de la description pour qu'elle occupe la largeur de la card en conservant des marges internes propres.
- [completed] Verifier le changement avec `npm run build`.

### Outcome

- La description de la preview card sur `/projects` n'est plus limitée a `38ch` et peut maintenant utiliser toute la largeur interne disponible de la card.
- Les marges visuelles restent conservees via le `padding` deja present sur la card, sans coller le texte aux bords.
- Le build `npm run build` passe apres ce changement cible.

## Global 3D Scroll Animation Parity

- [completed] Auditer la logique du logo 3D sur `/` et confirmer pourquoi l'animation de fin de scroll ne s'applique pas aux autres pages.
- [completed] Étendre proprement le mode scroll + inertie du logo 3D aux autres pages sans casser le cue spécifique de `/experience`.
- [completed] Vérifier le changement avec `npm run build` et une revue ciblée du flux de scroll sur `/experience`, `/projects` et `/contact`.

## Bottom Overscroll 3D Impulse

- [completed] Auditer pourquoi l'effet 3D cesse quand l'utilisateur continue de scroller alors que la page est deja en bas.
- [completed] Ajouter un declenchement par molette/trackpad en fin de page pour relancer l'inertie 3D sans mouvement reel du document.
- [completed] Verifier le changement avec `npm run build` et une revue ciblee du comportement d'overscroll sur les pages du site.

### Outcome

- Le logo 3D du header partage maintenant le meme mode de rotation liee au scroll et la meme inertie de fin de geste sur `/experience`, `/projects` et `/contact`, au lieu de reserver cet effet a `/`.
- Le cue de rotation complete propre a `/experience` reste prioritaire et bloque temporairement l'inertie pour eviter un conflit visuel.
- Une poursuite de scroll vers le bas alors que la page est deja au maximum declenche maintenant aussi une impulsion de rotation 3D via la molette ou le trackpad.

## Contact Horizontal Scroll Redesign

- [completed] Auditer la vue Contact existante, les styles globaux et les patterns GSAP/ScrollTrigger déjà utilisés dans le projet.
- [completed] Refaire `src/views/ContactView.vue` avec un layout premium: texte sticky à gauche, rail horizontal de cartes sociales et animation `ScrollTrigger` fluide avec cleanup complet.
- [completed] Ajuster les styles responsive et les garde-fous de performance pour conserver un rendu propre sur desktop et mobile.
- [completed] Vérifier la refonte avec `npm run build` et une revue ciblée de l'animation, du fallback responsive et du nettoyage GSAP.

## Projects Hover Reveal Redesign

- [completed] Installer Tailwind sans preflight et l'intégrer proprement à l'app pour pouvoir composer la nouvelle vue avec des utilities sans casser le style existant.
- [completed] Extraire les données projets dans `src/data/projectsData.ts` avec les champs nécessaires à la liste et à la floating card.
- [completed] Refaire `src/views/ProjectsView.vue` en hover reveal list avec tracking GSAP `quickTo`, état `activeProject` réactif et preview mobile cohérente.
- [completed] Vérifier la refonte avec un build et une revue ciblée du responsive desktop/mobile.

- [completed] Analyser le flash initial affiché avant la loading page au refresh.
- [completed] Aligner le `boot-loader` HTML sur la même police et le même positionnement que `LoadingScreen.vue`.
- [completed] Vérifier le correctif avec un build.
- [completed] Corriger le léger clipping du `s` final de `Certifications` sur la page `/experience`.
- [completed] Vérifier le correctif avec un build.
- [completed] Faire passer l'overshoot visuel de la bulle au-dessus de la capsule liquid sans casser le clipping du menu.
- [completed] Déplacer le rôle de clipping vers un viewport interne pour libérer la bulle.
- [completed] Vérifier le correctif avec un build.
- [completed] Ralentir la translation de la bulle du menu pour les trajets d'un seul index.
- [completed] Unifier ce nouveau timing entre le clic utilisateur et la synchronisation sur changement de route.
- [completed] Vérifier le correctif avec un build.
- [completed] Ralentir le dégonflement de la bulle du menu sur les trajets courts entre les index voisins.
- [completed] Ajuster la temporisation et la durée du `scale` sans changer la durée de déplacement latéral.
- [completed] Vérifier le correctif avec un build.
- [completed] Analyser pourquoi la bulle du menu paraît plus rapide entre `/` et `/experience` dans un sens que dans l'autre.
- [completed] Corriger la synchronisation de la bulle pour éviter qu'une mise à jour de layout relance l'animation en cours.
- [completed] Vérifier le correctif avec un build et une revue ciblée du flux `/` <-> `/experience`.
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
- [completed] Analyser pourquoi le texte du menu compact de `/experience` apparaît avant la fin du déploiement de la capsule liquid.
- [completed] Retarder l'affichage du contenu du menu jusqu'à la fin de l'expansion de la capsule, sans ralentir la fermeture.
- [completed] Vérifier le correctif avec un build.
- [completed] Supprimer l'over-extend visuel de la capsule liquid pendant le dépli du menu compact.
- [completed] Afficher le texte directement à sa position finale lors de son reveal.
- [completed] Vérifier le nouvel ajustement avec un build.
- [completed] Analyser pourquoi la molette sur une card de `/experience` bloque la montée de la card suivante.
- [completed] Rediriger la molette des cards vers le scroll principal de la scène `/experience`.
- [completed] Vérifier le correctif avec un build.
- [completed] Étendre la capture de la molette à toute la surface des cards de `/experience`.
- [completed] Vérifier l'ajustement global du scroll des cards avec un build.
- [completed] Réduire la lenteur du scroll redirigé sur les cards de `/experience`.
- [completed] Normaliser et amplifier le delta de molette pour retrouver une vitesse de défilement cohérente.
- [completed] Vérifier ce recalibrage avec un build.
- [completed] Retirer la redirection JS de molette sur desktop pour retrouver le comportement natif du trackpad au-dessus des cards.
- [completed] Réserver le scroll interne des cards aux petits écrans où il reste utile.
- [completed] Vérifier ce retour au scroll natif avec un build.
- [completed] Ralentir légèrement l'arrivée des cards de `/experience` en demandant un peu plus de scroll.
- [completed] Vérifier cet ajustement de rythme avec un build.
- [completed] Déclencher la rotation complète du logo 3D du header un peu avant que les 3 cards de `/experience` soient presque entièrement affichées.
- [completed] Relier le seuil de progression de la scène `/experience` à l'animation du logo sans déclenchements répétés parasites.
- [completed] Vérifier l'ajustement avec un build.
- [completed] Reprendre sur `/experience` la police de `Algorithmique Avancée, IA & Machine Learning` pour les sous-titres de la card `Certifications`.
- [completed] Vérifier avec un build ce changement ciblé de typographie.
- [completed] Reprendre sur `/experience` la même police pour les descriptions de la card `Volontariat`.
- [completed] Vérifier avec un build ce second changement ciblé de typographie.
- [completed] Passer en blanc les années de la card `Certifications` sur `/experience`.
- [completed] Vérifier avec un build ce changement ciblé de couleur.
- [completed] Supprimer proprement le badge `Stage` de la card `Expérience` sur `/experience`.
- [completed] Vérifier avec un build cette suppression ciblée.
- [completed] Reprendre la police des sous-titres de `Certifications` pour la liste de points de la card `Expérience`.
- [completed] Vérifier avec un build ce changement ciblé de typographie sur la liste.
- [completed] Intégrer le logo Carrefour en haut à droite de la card `Expérience` sur `/experience`.
- [completed] Vérifier avec un build cette intégration du logo.
- [completed] Réduire le logo Carrefour et passer son cartouche sur fond foncé dans la card `Expérience`.
- [completed] Vérifier avec un build cet ajustement visuel du logo.
- [completed] Passer sur fond transparent le cartouche du logo Carrefour dans la card `Expérience`.
- [completed] Vérifier avec un build cet ajustement de fond.
- [completed] Déplacer le fichier du logo Carrefour vers un emplacement statique adapté au projet.
- [completed] Vérifier avec un build que la référence du logo reste valide.
- [completed] Supprimer l'effet de survol des cards 1, 2 et 3 sur la page `/experience`.
- [completed] Vérifier le diff ciblé pour confirmer qu'aucune autre card n'est impactée.
- [completed] Reprendre sur `/projects` la même police que la description `Association de redistribution alimentaire...` pour le texte descriptif des cards projet.
- [completed] Vérifier avec un build ce changement ciblé de typographie sur `/projects`.
- [completed] Retirer proprement les badges à côté du nom du projet dans la preview card de `/projects`, déjà couverts par la section `Stack`.
- [completed] Vérifier avec un build ce nettoyage ciblé de la card projet.
- [completed] Reprendre sur `/projects` la même police que `ÉTUDIANT INGÉNIEUR` pour l'année, le numéro et les deux skills de chaque ligne projet.
- [completed] Vérifier avec un build ce changement ciblé de typographie sur la liste `/projects`.

# Review

- La page `/projects` a ete refondue en hover reveal list minimaliste, avec une liste editoriale plein format a la place de la grille de cards.
- Les donnees projets sont maintenant centralisees dans `src/data/projectsData.ts` et alimentees reactively dans une preview card dediee.
- La floating card suit le curseur via GSAP `quickTo`, s'ouvre et se referme en `autoAlpha`/`scale`, et reste bornee dans le viewport.
- Un fallback mobile affiche la meme preview card inline sous la liste pour conserver une experience propre sans dependance au hover.
- Tailwind a ete ajoute sans preflight pour utiliser des utilities sur cette refonte sans perturber le CSS existant du site.
- Le build `npm run build` passe apres la refonte.

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
- Le texte du menu compact sur `/experience` reste désormais masqué pendant l'expansion de la capsule liquid et n'est révélé qu'une fois l'ouverture terminée, avec une fermeture toujours immédiate.
- Pendant ce reveal, la bulle active reste maintenant masquée pour éviter tout dépassement visuel hors de la capsule, et le texte n'effectue plus de translation avant apparition.
- La molette au-dessus d'une card de `/experience` pilote maintenant le scroll principal de la scène au lieu de bloquer dans la zone interne de la card.
- La redirection de molette couvre désormais toute la card, y compris son header et ses marges internes, plus seulement le body scrollable.
- Le delta de molette redirigé est maintenant normalisé selon le `deltaMode` et amplifié pour éviter une montée trop lente des cards dans la scène pinned.
- Sur desktop, les cards de `/experience` ne capturent plus le scroll du trackpad : le comportement redevient natif comme sur le background, et le scroll interne n'est conservé qu'en mobile.
- La timeline scrollée de `/experience` demande maintenant un peu plus de distance avant l'arrivée complète des cards, pour un rythme légèrement moins rapide.
- L'arrivée sur `/experience` force maintenant un scroll top instantané, sans hériter du `scroll-behavior: smooth` global.
- Le retour sur `/` recale les lettres du logo depuis leur position de départ et nettoie les transforms GSAP résiduelles sur le logo du header.
- Le build `npm run build` passe après ce correctif de navigation.
- Une navigation vers `/` force maintenant aussi un scroll top instantané depuis le watcher global de route, sans dépendre uniquement du montage de la home.
- Le build `npm run build` passe après ce renforcement du comportement de retour sur `/`.
- Le retour de `/experience` vers `/` décale maintenant le reset de scroll après le changement de vue et deux frames, pour éviter qu'un cleanup GSAP/ScrollTrigger ne réapplique l'ancienne position.
- Le build `npm run build` passe après ce correctif ciblé sur la transition `/experience` -> `/`.
- La bulle du menu conserve maintenant sa durée de déplacement calculée pendant le clic, et les recalages de layout liés à la navigation ou au resize sont différés puis appliqués sans transition pour éviter une accélération perçue entre `/` et `/experience`.
- Le build `npm run build` passe après ce correctif de synchronisation du header.
- Le mot mis en avant `Certifications` sur `/experience` reçoit maintenant un léger padding inline-end pour éviter que le `s` final soit rogné pendant le hero centré.
- Le build `npm run build` passe après ce correctif ciblé de clipping sur `/experience`.
- La scène `/experience` émet maintenant un signal dédié quand les trois cards approchent de leur état quasi final, avec hystérésis pour éviter les déclenchements parasites au voisinage du seuil.
- Les lettres 3D du header consomment ce signal sur `/experience` pour effectuer une rotation complète anticipée, puis se recalent proprement sur la rotation pilotée par le scroll une fois le tour terminé.
- Le build `npm run build` passe après cet ajustement de synchronisation entre cards et logo.
- Les sous-titres `Liora (ex DataScientest)`, `Domaine de spécialité` et `MOOC validé` de la card `Certifications` sur `/experience` utilisent maintenant la même police `system-ui, sans-serif` que `Algorithmique Avancée, IA & Machine Learning` sur la home.
- Le build `npm run build` passe après ce changement ciblé de typographie.
- Les deux descriptions de la card `Volontariat` sur `/experience` utilisent maintenant elles aussi la même police `system-ui, sans-serif` que le texte de référence sur la home.
- Le build `npm run build` passe après ce second ajustement typographique ciblé.
- Les années affichées dans la card `Certifications` sur `/experience` sont maintenant forcées en blanc sans impacter les autres dates de la page.
- Le build `npm run build` passe après ce changement ciblé de couleur.
- Le badge `Stage` de la card `Expérience` sur `/experience` a été retiré du rendu et du modèle de données associé, sans conserver de structure inutile.
- Le build `npm run build` passe après cette suppression ciblée.
- Les points `Analyse de données commerciales` à `Aide à la décision basée sur la data` dans la card `Expérience` sur `/experience` utilisent maintenant la même police `system-ui, sans-serif` que `Liora (ex DataScientest)`.
- Le build `npm run build` passe après ce changement ciblé de typographie sur la liste.
- Le logo Carrefour est maintenant affiché en haut à droite de la card `Expérience` sur `/experience`, dans un conteneur discret dimensionné pour rester propre sur desktop et mobile.
- Le build `npm run build` passe après cette intégration du logo.
- Le logo Carrefour de la card `Expérience` a été réduit et son cartouche utilise maintenant un fond foncé cohérent avec la card.
- Le build `npm run build` passe après cet ajustement visuel du logo.
- Le cartouche du logo Carrefour dans la card `Expérience` est maintenant sur fond transparent, sans bordure ni ombre résiduelle.
- Le build `npm run build` passe après cet ajustement de fond.
- Le fichier du logo Carrefour n'est plus stocké à la racine du projet et est désormais rangé dans `public/brands/carrefour-logo.png`, emplacement cohérent pour un asset statique servi tel quel.
- Le build `npm run build` passe après ce rangement du fichier logo.
- Les trois cards de `/experience` ignorent maintenant le `hover` global de `.glass` et conservent leur état visuel de base au survol.
- Le contrôle a été limité au composant `ExperienceSceneCard` pour ne pas modifier les autres cards du site.
- Le dégonflement de la bulle du menu est maintenant plus progressif sur les trajets courts grâce à une durée de `scale` dédiée et un relâchement plus tardif de l'état `growing`, sans changer la durée de translation horizontale.
- Le build `npm run build` passe après cet ajustement du timing de la bulle.
- La translation de la bulle pour un déplacement d'un seul index utilise maintenant un timing dédié plus lent, partagé entre le clic et le watcher de route pour garder un comportement symétrique entre `0 -> 1` et `1 -> 0`.
- Le build `npm run build` passe après cet ajustement de la translation du menu.
- Le clipping du menu est maintenant porté par un viewport interne, ce qui laisse l'overshoot de la bulle dépasser visuellement au-dessus de la capsule liquid tout en conservant le fond et la liste correctement masqués.
- Le build `npm run build` passe après ce correctif d'overshoot du menu.
- Le placeholder `#boot-loader` dans `index.html` reprend maintenant la même structure visuelle que `LoadingScreen.vue`, avec la même police et le même centrage optique du `JG.` au refresh.
- La description des cards de `/projects` utilise maintenant la même police `system-ui, sans-serif` que `Association de redistribution alimentaire. Animations et sensibilisations sur le gaspillage.` sur `/experience`.
- La preview card de `/projects` n'affiche plus de badges à côté du nom du projet ; le détail de techno reste uniquement dans la section `Stack`, sans doublon visuel.
- La liste de `/projects` utilise maintenant la même police `Helvetica Neue, Helvetica, Arial, sans-serif` que `ÉTUDIANT INGÉNIEUR` pour l'année, le numéro d'ordre et les deux skills affichés sur chaque ligne, sans changer leurs tailles.
- La page `/contact` est maintenant une scène premium pilotée par `GSAP ScrollTrigger`, avec une intro ancrée à gauche et un rail horizontal de cartes qui traverse l'écran pendant le scroll vertical.
- Le desktop utilise un `pin` avec translation GPU du track et barre de progression, tandis que le mobile et `prefers-reduced-motion` basculent proprement vers une pile verticale sans pinning.
- Le build `npm run build` passe après cette refonte de `/contact`.
- Après retour utilisateur, la version finale de `/contact` a ete simplifiee: plus de grand panneau ni de texte long, juste le background existant, un bloc intro minimal et des cards `glass` sobres alignees sur la landing.
