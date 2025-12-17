# SPFx Task Board Webpart

Denne repo skitserer hvordan du kan bygge en SharePoint Online SPFx webpart, der læser opgaver og underopgaver fra en liste og gengiver dem i et kort-baseret UI.

## Forudsætninger

- Node.js LTS (anbefalet 18.x) og SPFx generator (`@microsoft/generator-sharepoint`)
- Gulp CLI globalt installeret
- En SharePoint Online liste med kolonnerne:
  - **Title** (opgavenavn)
  - **Status** (Choice, f.eks. Ny, I gang, Færdig)
  - **DueDate** (DateTime)
  - **AssignedTo** (Person/Group, enkeltværdi)
  - **ParentId** (Number, valgfri reference til et andet listeelement for underopgaver)
  - **Progress** (Number 0-100)

## Arkitektur

Webparten består af:

- En webpart-klasse (`TaskBoardWebPart`) der kalder SharePoint REST API via `@microsoft/sp-http`.
- Et React UI (`TaskBoard`) der viser overblik, statusbadge og underopgaver.
- Simpel datamodel der grupperer underopgaver pr. hovedopgave (ParentId).

## Sådan kommer du i gang

1. Kør `yo @microsoft/sharepoint` og vælg **React** webpart.
2. Erstat de genererede filer med indholdet i `src/TaskBoardWebPart.ts` og `src/components/TaskBoard.tsx` (justér stier afhængigt af den genererede struktur).
3. Opdater `TaskBoardWebPart.manifest.json` med passende beskrivelse og ikoner.
4. Kør `npm install` og `gulp serve --nobrowser` for lokal test med Workbench.
5. I Workbench: indsæt webparten, åbn property pane og angiv den task-liste titel du vil bruge.
6. Hvis du får en fejlbesked i webparten, tjek at listen findes, at felter matcher nedenstående skema, og at din bruger har rettigheder til at læse den.

> Tip til hurtig test: Opret en liste med navn **Tasks** og kolonnerne Title (Standard), Status (Choice), DueDate (Date/Time), AssignedTo (Person, enkeltværdi), ParentId (Number), Progress (Number). Opret et par elementer hvor ParentId peger på et andet element for at se underopgaver.

## Listekald og sikkerhed

- Eksemplet bruger REST-endpointet `_api/web/lists/getbytitle('Tasks')/items?$select=Id,Title,Status,DueDate,AssignedTo/Title,AssignedTo/EMail,ParentId,Progress&$expand=AssignedTo`.
- Hvis du hellere vil bruge Microsoft Graph, kan du erstatte kaldet med `graphHttpClient` og endpointet `/sites/{site-id}/lists/{list-id}/items`.
- Husk at justere feltnavne, hvis din liste bruger andre kolonnenavne.

## Layout

UI'et er inspireret af det viste design: venstre navigation, oversigtsstatistik og kort med underopgaver. Farver og badges kan tilpasses i SCSS-filen, men komponenten bruger primært Office UI Fabric/Fluent UI kontroller (f.eks. `Persona`, `ProgressIndicator`, `Tag`).

## Videreudvikling

- Tilføj PnP Property Pane felter for at vælge liste, farver og status-kolonner.
- Implementer caching via `@pnp/sp` eller `msgraph-client` for bedre performance.
- Tilføj filtrering på status og ressource eller en detaljeret visning med panel og kommentarer.

## Fejlfinding

- Tjek browserkonsollen for CORS eller tilladelsesfejl; webparten skal deployes til samme SharePoint domæne.
- Brug `?debugManifestsFile=`-parametret i Workbench, hvis du udvikler med lokal host.
