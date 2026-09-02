# VERTEX — 3D ULPIN Generation & Vertical Property Mapping System

A Smart India Hackathon prototype for the problem statement **"3D ULPIN Generation and
Vertical Property Mapping System."**

VERTEX is a government/GIS-style web application demonstrating how properties inside a
multi-storey building can be uniquely identified and mapped in 3D. The pilot digital twin
is **RV Block, Saranathan College of Engineering, Tiruchirappalli, Tamil Nadu**.

> ⚠️ **PROTOTYPE SPATIAL DATA.** Exact architectural floor plans and dimensions for RV
> Block are not publicly verified. All room geometry in this project is an editable,
> illustrative prototype — not an official architectural drawing, and not the official
> Government ULPIN. See [Replacing prototype data](#replacing-prototype-data-with-real-data) below.

---

## Tech stack

- React 18 + Vite
- Three.js via `@react-three/fiber` + `@react-three/drei`
- Tailwind CSS
- lucide-react icons
- Local JSON/JS mock data only — no backend, no database, no auth

---

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
npm run preview
```

---

## Feature map

| Feature | Where to find it |
|---|---|
| Interactive 3D digital twin (orbit/zoom/click/hover) | **3D Explorer** page, `src/three/BuildingScene.jsx` |
| Exploded floor view | "Exploded View" button in 3D Explorer, `src/three/ExplodedViewController.jsx` |
| Prototype Vertical Property ID generation | `src/utils/propertyId.js` → `generateVerticalPropertyId()` |
| Vertical stack analysis (room above/below) | **Vertical Analysis** page, `src/utils/verticalAnalysis.js` |
| Floor-wise 2D property mapping | **Floor Mapping** page, auto-generated SVG from room data |
| Spatial conflict detection | **Conflict Detection** page, `src/utils/conflictDetection.js` |
| Global property search | Navbar search bar, `src/components/SearchBar.jsx` |
| 4D property timeline | **Timeline** page, `src/pages/Timeline.jsx` |
| Property registry table | **Property Registry** page, `src/components/RegistryTable.jsx` |

---

## Project structure

```
src/
  components/       Navbar, Sidebar, PropertyPanel, FloorSelector,
                     SearchBar, ConflictPanel, RegistryTable, WelcomeModal
  three/            BuildingScene, BuildingFloor, PropertyRoom,
                     CameraController, BuildingControls,
                     ExplodedViewController, VerticalStack
  pages/            Dashboard, Explorer, FloorMapping, VerticalAnalysis,
                     ConflictDetection, Registry, Timeline
  data/
    buildingData.js  <-- single source of truth for all building/floor/room geometry
  utils/
    propertyId.js         generateVerticalPropertyId(), flattenRooms()
    geometry.js            bounding-box helpers, area, overlap
    verticalAnalysis.js    detectVerticalStack()
    conflictDetection.js   detectAllConflicts() and individual checks
  context/
    AppContext.jsx    shared app state (selection, exploded view, floor
                       isolation, timeline year) used across every page
  App.jsx, main.jsx
```

---

## Data architecture

**All room geometry lives in one file: `src/data/buildingData.js`.** Nothing in the React
components or Three.js scene hardcodes coordinates — the entire building, every floor
slab, corridor, staircase core, and room box is generated procedurally from this file.

```js
const buildingData = {
  building: { name: "RV Block", institution: "Saranathan College of Engineering", ... },
  floors: [
    {
      id: "F03", numId: "03", name: "Third Floor", elevation: 12,
      rooms: [
        { number: "303", name: "RV 303", type: "Classroom",
          x: 18, y: 3, width: 8, depth: 6, height: 3.5,
          officialReference: true, dataConfidence: "Prototype" }
      ]
    }
  ]
}
```

- Room numbers marked `officialReference: true` (e.g. RV 302, RV 303, RV 403–413) are
  drawn from publicly referenced RV Block room numbering.
- **Every** room's exact wall coordinates are still `dataConfidence: "Prototype"` —
  only the numbering itself is publicly referenced, not the geometry.
- `BUILDING_BOUNDARY`, `CORRIDOR`, and `STAIRCASE` (also exported from `buildingData.js`)
  define the shared floor-plate boundary, corridor strip, and staircase/core block reused
  by every floor.

The Vertical Property ID (`TN-TRY-SCE-RV-F03-R303`) is **not stored** in the data file —
it's computed on demand by `generateVerticalPropertyId(floor, room)` from the floor's
`numId` and the room's `number`, so renumbering or restructuring floors never leaves
stale IDs behind.

---

## Key algorithms

All implemented in `src/utils/`, deliberately simple bounding-box math:

1. **`generateVerticalPropertyId(floor, room)`** — builds `TN-TRY-SCE-RV-F{floor}-R{room}`.
2. **`detectVerticalStack(selectedRoom, allRooms)`** — compares X/Y footprints of every
   room against the selected one; two rooms on different floors are "vertically aligned"
   when ≥50% of the smaller footprint overlaps the other. Returns the ordered stack plus
   the room directly above/below.
3. **`detectOverlaps` (`detectHorizontalOverlaps` / `detectSuspiciousVerticalOverlaps`)** —
   axis-aligned rectangle intersection tests, run per floor (horizontal) and across floors
   (vertical) to flag geometry anomalies.
4. **`calculateArea(room)`** — `width × depth`.
5. **`getRoomElevation(floor)`** — returns the floor's configured elevation in metres.

The Conflict Detection page also checks for **duplicate IDs**, **missing IDs**, and
**rooms outside the building boundary**.

---

## Replacing prototype data with real data

The whole point of the data-driven architecture is to make this swap painless later:

1. **Keep the shape.** `buildingData.building`, `buildingData.floors[]`, and each
   `floor.rooms[]` object must keep the same fields (`x`, `y`, `width`, `depth`, `height`,
   `number`, `name`, `type`). Everything downstream (3D scene, 2D floor maps, ID
   generation, vertical analysis, conflict detection) reads from these fields only.
2. **Swap the source.** Replace the hand-authored arrays in
   `src/data/buildingData.js` with data loaded/transformed from:
   - Verified CAD floor plans (export room polygons → bounding boxes, or extend the
     room schema to polygons and update `PropertyRoom.jsx` / the 2D SVG renderer)
   - GIS survey data (coordinates can be re-projected into the building's local X/Y frame)
   - Building Information Models (BIM) — IFC room/space objects map naturally onto the
     `rooms[]` schema (`x`, `y`, `width`, `depth`, `height`, elevation per storey)
   - Government ULPIN datasets, once a vertical/3D ULPIN schema is finalized — at that
     point `generateVerticalPropertyId()` should be updated to emit the official format
     instead of the current `TN-TRY-SCE-RV-F{floor}-R{room}` prototype convention.
3. **Update `officialReference` / `dataConfidence`** per room once its geometry has been
   verified against a real source, so the UI's "Prototype Room" vs "Publicly Referenced"
   badges (and the registry's Prototype/Referenced status column) reflect true provenance.
4. **No component changes needed** for a straightforward swap — `BuildingScene`,
   `BuildingFloor`, `FloorMapping`'s SVG renderer, the registry table, and the conflict
   detector all iterate over `buildingData.floors[].rooms[]` generically.

---

## Disclaimer

The current RV Block geometry is a prototype generated from publicly available building
and room references. It is not an official architectural floor plan and can be replaced
with verified survey, CAD, BIM or GIS data. The Vertical Property ID format used here
(`TN-TRY-SCE-RV-F{floor}-R{room}`) is a prototype convention for this hackathon and does
not replace the official Government ULPIN.
