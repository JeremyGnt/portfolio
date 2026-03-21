# Todo

## SEO Route Prerender And Identity Signals

- [completed] Auditer le runtime client et le build Vite pour mettre en place un prerender statique route par route sans casser la navigation existante.
- [completed] Generer un HTML initial propre pour `/`, `/experience`, `/projects` et `/contact` avec titre, description, canonical, OG/Twitter et contenu prerendu.
- [completed] Rendre le maillage interne crawlable avec de vrais liens HTML et ajouter des donnees structurees d'identite (`sameAs`) pour relier le site a LinkedIn/GitHub.
- [completed] Ajouter un support optionnel pour Google Search Console et GA4 via variables d'environnement, verifier avec `npm run build`, puis consigner le resultat.

### Outcome

- Le build genere maintenant un vrai HTML par route pour `/`, `/experience`, `/projects` et `/contact`, au lieu d'une coque SPA identique servie partout.
- Les pages prerendered injectent des `title`, `description`, `canonical`, Open Graph, Twitter Cards et JSON-LD coherents avec l'URL demandee, ce qui corrige le signal de duplication vers la home.
- Le shell global a ete rendu compatible SSR/hydratation sans casser la navigation ni les animations cote client, en detectant le markup prerendu et en evitant le wrapper `Transition` cote serveur.
- Le menu principal expose maintenant de vrais liens `href`, donc Google peut decouvrir les pages via le maillage interne et plus seulement via le sitemap.
- Un pipeline de prerender Vite + SSR a ete ajoute dans `scripts/prerender.mjs`, avec support optionnel de `VITE_GOOGLE_SITE_VERIFICATION` et `VITE_GA_MEASUREMENT_ID` via `.env.example`.
- `vercel.json` ne force plus toutes les routes vers `index.html`, ce qui laisse Vercel servir les vrais fichiers `dist/contact/index.html`, `dist/projects/index.html`, etc.
- Verification effectuee: `npm run build` passe; `dist/contact/index.html` contient bien le `h1`, le texte de contact, la canonical `https://jeremygonnet.com/contact`, les liens de menu en `href` et le JSON-LD `Person`/`ContactPage`.

## Static 3D Logo On Internal Scroll

- [completed] Auditer `src/composables/useLogoThreeScene.ts` pour identifier toutes les rotations pilotées par le scroll sur `/experience`, `/projects` et `/contact`.
- [completed] Retirer proprement le pilotage par scroll, inertie et overscroll sur ces trois pages tout en conservant les transitions de route utiles.
- [completed] Vérifier le changement avec `npm run build` et consigner le résultat.

### Outcome

- Le logo 3D du header ne suit désormais le scroll, l'inertie et l'overscroll que sur `/`; sur `/experience`, `/projects` et `/contact`, les lettres restent fixes pendant le défilement.
- Le cue spécifique de rotation déclenché par la progression scrollée de `/experience` a été supprimé pour éviter toute rotation résiduelle liée à cette page.
- `npm run build` passe après ce nettoyage.

## SEO Technique Vercel

- [completed] Auditer le stack, les routes publiques et le fallback Vercel pour choisir une implementation SEO native a la SPA Vue/Vite.
- [completed] Ajouter les fichiers techniques publics attendus (`sitemap.xml`, `robots.txt`, assets SEO) et des metadonnees/canonicals propres par route.
- [completed] Verifier le build et controler localement les endpoints SEO ainsi que les metadonnees principales, puis consigner le resultat.

### Outcome

- Le projet utilise une SPA Vue 3 + Vite avec `vue-router`, donc le SEO technique a ete implemente nativement pour ce stack: fichiers statiques dans `public/` et metadonnees pilotees par route cote client.
- `public/sitemap.xml`, `public/robots.txt`, `public/manifest.json` et `public/og-image.svg` ont ete ajoutes; le build `dist/` contient bien ces fichiers.
- `index.html`, `src/router/index.ts`, `src/main.ts` et `src/seo.ts` configurent maintenant un `title`, une `description`, les balises Open Graph/Twitter, `robots` et un canonical cohérents avec le domaine `https://jeremygonnet.com`, y compris sur `/experience`, `/projects` et `/contact`.
- `vercel.json` a ete resserre pour ne faire le fallback SPA que sur les routes sans extension, ce qui evite que `/sitemap.xml`, `/robots.txt`, `/manifest.json` ou `/favicon.ico` tombent sur la landing.
- Verification locale effectuee: `npm run build` passe; `http://127.0.0.1:4173/sitemap.xml` repond `200` en `text/xml`, `robots.txt` repond `200` en `text/plain`, `manifest.json` repond `200` en `application/json`, et les pages `/`, `/experience`, `/projects`, `/contact` exposent les bons `title`, `description` et `canonical` apres execution du JS.
- Verification production effectuee le 21 mars 2026 avant deploiement du correctif: `https://jeremygonnet.com/sitemap.xml` et `https://jeremygonnet.com/robots.txt` renvoient encore l'HTML de la landing. Le depot est corrige, mais le domaine live ne refletera ce fix qu'apres deploiement sur Vercel.

## Projects Airbnb Github Hint

- [completed] Inspecter la preview card et la cible GitHub existante a reutiliser pour `/projects`.
- [completed] Ajouter un indicateur visuel base sur la fleche des cards `/contact` avec le logo GitHub sur la card `Airbnb for Students`.
- [completed] Relier le clic du projet a ton GitHub pour cette premiere iteration.
- [completed] Tenter une verification avec `npm run build` et consigner le blocage actuel du repo.

### Outcome

- La preview card du projet `Airbnb for Students` affiche maintenant la fleche `ArrowUpRight` utilisee sur `/contact`, en jaune, avec le logo GitHub juste a cote en haut a gauche.
- Le clic sur la ligne de ce projet dans `/projects` ouvre maintenant le profil GitHub `https://github.com/JeremyGnt` dans un nouvel onglet pour cette premiere iteration.
- La cible GitHub reste centralisee dans `src/constants/externalLinks.ts`.
- La verification `npm run build` est actuellement bloquee par des erreurs TypeScript hors de cette modif dans `src/router/index.ts` et `src/seo.ts`.

## Projects Cursor Card No Bottom Clamp

- [completed] Reprendre la logique de protection de la floating card du premier projet.
- [completed] Rendre explicite qu'il n'y a qu'une borne haute de securite, sans aucune restriction vers le bas.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- La floating card du premier projet conserve uniquement une borne haute pour ne pas passer derriere la barre d'onglet.
- Aucune borne basse n'est appliquee: la card peut descendre librement vers le bas comme avant.
- `npm run build` passe apres ce nettoyage cible.

## Projects Cursor Card First Project Only

- [completed] Reprendre le correctif de clamp viewport de la floating card sur `/projects`.
- [completed] Limiter la borne haute au seul premier projet, sans changer le comportement des autres cards.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- La borne haute de securite de la floating card sur `/projects` ne s'applique maintenant qu'au premier projet affiche.
- Les autres cards conservent leur suivi curseur d'origine, sans clamp additionnel.
- `npm run build` passe apres cette correction ciblee.

## Projects Cursor Card Top Clamp

- [completed] Inspecter le positionnement de la floating card sur `/projects` pour comprendre pourquoi elle se fait couper en haut pres du premier projet.
- [completed] Ajouter un clamp viewport sur la position de la floating card en conservant son ancrage interne sur les badges.
- [completed] Verifier le correctif avec `npm run build` puis consigner le resultat.

### Outcome

- La floating card de `/projects` est maintenant bornee dans le viewport avec une marge de securite, ce qui evite que son haut se fasse couper quand le premier projet est survole pres du bord superieur.
- Le point d'ancrage interne de la card reste cale sur la zone badges, puis la position finale est reclampée pour rester visible en haut comme en bas.
- `npm run build` passe apres ce correctif.

## Projects List Tags Active Only

- [completed] Corriger la couleur de base des `listTags` sur `/projects` pour annuler la mise en or permanente.
- [completed] Conserver `#ebb207` uniquement sur les etats selectionne/focus du projet.
- [completed] Verifier la correction avec `npm run build` puis consigner le resultat.

### Outcome

- Les `listTags` de `/projects` ont retrouve leur couleur d'origine hors selection.
- La couleur `#ebb207` s'applique maintenant uniquement quand la ligne projet est selectionnee ou focus.
- `npm run build` passe apres cette correction.

## Projects List Tags Color

- [completed] Reprendre le style des `listTags` sur la page `/projects`.
- [completed] Passer la couleur des `listTags` a `#ebb207`.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- Les `listTags` de la page `/projects` utilisent maintenant la couleur `#ebb207`.
- Le changement est purement visuel et conserve les interactions hover/focus existantes.
- `npm run build` passe apres ce changement.

## Projects Years Color

- [completed] Reprendre le style des annees sur la page `/projects`.
- [completed] Passer la couleur des annees a `#ebb207`.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- Les annees affichees sur la page `/projects` utilisent maintenant la couleur `#ebb207`.
- Le changement est purement visuel et ne modifie ni l'ordre des projets ni les interactions existantes.
- `npm run build` passe apres ce changement.

## Projects Hover Edge Arrows Color

- [completed] Reprendre le style des marqueurs lateraux `►` et `◄` sur `/projects`.
- [completed] Passer leur couleur en blanc sans modifier leur reveal ni leur positionnement.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- Les marqueurs lateraux `►` et `◄` de la ligne active sur `/projects` sont maintenant blancs.
- Leur position, leur animation de reveal et leur comportement hover/focus restent inchanges.
- `npm run build` passe apres ce changement.

## Projects Hover Edge Arrows

- [completed] Reprendre la ligne active de `/projects` pour identifier ou injecter deux marqueurs lateraux sans casser le layout.
- [completed] Ajouter les glyphes `►` et `◄` aux extremites opposees du projet actif avec un reveal discret au hover/focus.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- La ligne projet active sur `/projects` affiche maintenant `►` a gauche et `◄` a droite, chacun a l'oppose de l'autre, uniquement a l'etat hover/focus.
- Le reveal reste discret via `opacity` et un léger glissement lateral, sans modifier la logique de selection ni la preview card.
- `npm run build` passe apres ce changement.

## Projects Sorting By Year

- [completed] Inspecter la structure de `src/views/ProjectsView.vue` et la source `src/data/projectsData.ts` pour identifier le bon point d'application du tri.
- [completed] Regrouper la liste `/projects` par annee en ordre decroissant, en conservant le comportement de preview active.
- [completed] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- La page `/projects` regroupe maintenant les projets par annee avec les annees les plus recentes affichees en premier.
- Le comportement de hover/focus/click et la preview card restent inchanges; seul l'ordre editorial de la liste a ete restructure autour des groupes d'annee.
- `npm run build` passe apres ce changement.

## Contact Data Obfuscation

- [completed] Auditer `src/views/ContactView.vue` pour reperer les donnees sensibles exposees en clair dans le HTML de `/contact`.
- [completed] Retirer les `href` mail, telephone et LinkedIn du markup et reconstruire les actions cote client a partir d'une version obfusquee.
- [completed] Supprimer de l'UI les coordonnees visibles, meme obfusquees, au profit de libelles generiques par carte.
- [pending] Verifier le changement avec `npm run build` puis consigner le resultat.

### Outcome

- Les cartes `/contact` n'exposent plus les `href` sensibles ni les valeurs completes dans le markup initial: les boutons reconstruisent maintenant l'action au clic a partir d'une version encodee cote client.
- L'interface n'affiche plus les coordonnees, meme obfusquees: seules des intentions generiques comme `Envoyer un message`, `Ouvrir le profil` ou `Appeler` restent visibles.

## Ajout Projet Snoopy

- [completed] Inspecter la source de donnees de `/projects` et verifier l'asset image disponible pour le nouveau projet.
- [completed] Ajouter l'entree du projet 2023 dans `src/data/projectsData.ts` avec description, hard skills et visuel associe.
- [completed] Verifier le changement avec `npm run build`.
- [completed] Convertir le visuel `projet_snoopy` en WebP, mettre a jour la reference et reverifier le build.

### Outcome

- La page `/projects` reference maintenant un nouveau projet `Jeu console inspire de Snoopy` date de 2023.
- L'entree reprend la description fournie, les hard skills cles et utilise maintenant `public/projects/projet_snoopy.webp`.
- `npm run build` passe apres l'ajout.

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

## Experience Mobile Wallet Stack

- [completed] Auditer la scene mobile existante de `/experience` et isoler la logique scrollée a remplacer uniquement sur telephone.
- [completed] Ajouter dans `src/views/ExperienceView.vue` un etat mobile Wallet a deux modes (`stack` et `focus`) avec stack chevauche au chargement et reset au tap sur une card reduite.
- [completed] Adapter `ExperienceSceneCard` pour autoriser le scroll interne seulement sur la card active en mobile et garder les cards reduites visuellement fermees.
- [completed] Desactiver l'ancienne timeline GSAP mobile dans `useExperienceSceneAnimation` sans toucher au comportement desktop.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- Sur telephone, `/experience` n'utilise plus la montee scrollée precedente: la page arrive directement sur un stack type Wallet avec les trois cards chevauchees, la card 3 dans le slot principal et les cards 2 puis 1 visibles par leur tete au-dessus.
- Un tap sur une card mobile ne change pas sa taille: la card choisie vient simplement prendre le meme slot principal que la card de premier plan de l'etat de base.
- Les deux autres cards descendent sous l'ecran avec seulement leur tete visible juste au-dessus du menu mobile, puis un tap sur l'une d'elles remet la scene a l'etat initial.
- `ExperienceSceneCard` n'autorise le scroll interne que pour la card active en mobile, ce qui garde les cards reduites propres et lisibles tout en laissant le contenu complet accessible.
- Verification effectuee: `npm run build` passe apres ce changement.

## Experience Mobile Wallet Dock Alignment

- [completed] Abaisser le dock mobile de `/experience` pour que les cards reduites viennent vraiment se poser au plus pres du bas de l'ecran, juste au-dessus du menu.
- [completed] Isoler le `LiquidMenu` mobile de tout etat `compact` emis par `/experience` pour eviter les disparitions ou masquages intermittents.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- Le dock mobile des cards reduites sur `/experience` est maintenant descendu plus bas: la card reduite de premier plan vient se poser au ras du menu mobile, avec son titre juste au-dessus.
- La seconde card reduite reste accessible derriere comme un vrai stack Wallet, mais ne remonte plus inutilement au milieu de l'ecran.
- Le `LiquidMenu` mobile ignore maintenant les evenements de compaction emis par la scene `/experience`, ce qui evite les disparitions intermittentes du menu sur telephone.
- Verification effectuee: `npm run build` passe apres cet ajustement.

## Experience Mobile Wallet Fixed Slot

- [completed] Recaler la scene mobile selon le schema utilisateur: un slot principal fixe et des cards secondaires dockees en bas sans redimensionnement.
- [completed] Garder une hauteur de card stable entre l'etat de base et l'etat focus, puis ne faire varier que les positions des cards.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- La card active mobile garde maintenant la meme taille que la card principale de l'etat initial; seul son emplacement change.
- Les cards non actives sont poussees sous l'ecran avec un simple reveal de header au-dessus du menu, au lieu de comprimer ou d'etirer la card active.
- Verification effectuee: `npm run build` passe apres ce recalage.

## Experience Mobile Wallet Stack Order And Size

- [completed] Reprendre la geometrie du stack initial mobile pour supprimer l'effet de cards coupees et mieux utiliser la hauteur disponible.
- [completed] Reordonner le dock mobile en focus pour que la card `3` reste au-dessus de la `1` quand la `2` est selectionnee.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- La hauteur des cards mobiles est maintenant calculee depuis l'espace reel disponible dans la scene, ce qui reduit l'effet de card coupee a l'etat initial.
- En mode focus, l'ordre du mini-stack bas reste maintenant `3` au-dessus de `1` quand la card `2` est active, conformement au schema demande.
- Verification effectuee: `npm run build` passe apres cet ajustement.

## Experience Mobile Wallet Active Offset

- [completed] Relever davantage la card active mobile sans modifier sa hauteur ni l'etat initial du stack.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- La card selectionnee sur `/experience` utilise maintenant un `top` dedie plus haut que le slot principal de base, sans changer sa taille.
- L'etat initial et le dock bas des cards reduites restent inchanges.
- Verification effectuee: `npm run build` passe apres cet ajustement.

## Experience Mobile Scroll Lock

- [completed] Retirer le scroll de la page `/experience` en mode mobile uniquement.
- [completed] Neutraliser aussi le scroll interne de la card active mobile pour garder une scene totalement fixe.
- [completed] Verifier le resultat avec `npm run build` et consigner l'outcome.

### Outcome

- `/experience` ajoute maintenant une classe `body` mobile-only qui verrouille `overflow` et l'overscroll pendant l'affichage sur telephone.
- La card active mobile ne scrolle plus en interne non plus; toute la scene reste fixe.
- Verification effectuee: `npm run build` passe apres ce verrouillage.

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
