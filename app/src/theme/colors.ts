/**
 * Sampled from the game's own art (pixel-picked from app/src/images). Two families and no more: the
 * dark green of the jungle the whole board is drawn on, and the gold the game is named after — the
 * canvas of the tents, the frames of the Camp de base powers, the glow of the relics.
 *
 * Deliberately away from the colours the material uses to mean something: the blue of an
 * Archaeologist pawn and the green of an Animal disc are read as pieces, so no chrome of the
 * interface may borrow them.
 */
export const colors = {
  // Canopy — the mass of leaves every Jungle card is built on: shadowed floor (#1A251F), mid green
  // (#243B21), sunlit frond (#478345).
  jungle: '#243B21',
  jungleDeep: '#1A251F',
  jungleLight: '#478345',

  // Aurealis gold — the frames of the four powers on a Camp de base (#BD852C) and the glow of the
  // relics on its workbench (#E2A71D).
  gold: '#BD852C',
  goldDeep: '#7E5A1D',
  goldLight: '#E2A71D',

  // Tent canvas — the expedition's own cloth, in the shade (#E5C068) and in full sun (#F9E6A2).
  canvas: '#E5C068',
  canvasLight: '#F9E6A2',
  /** Field notes and paper labels: what carries text over the dark green. */
  parchment: '#F6EFDD',

  // Terracotta of the pots dug out of the crates. The alert colour, and nothing else.
  clay: '#C4653A',
  clayDeep: '#7E3A1F',
  clayLight: '#E0945A'
}
