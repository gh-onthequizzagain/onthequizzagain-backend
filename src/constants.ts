//export const PORT_SERVER = process.env.PORT;
export const PORT_SERVER = 3000;

export const PORT_BD = 27017;
export const URI_BD = process.env.URI_BD;

// Nom de la base de données MongoDB.
export const DB_NAME = "onthequizzagain";

// Rayon de recherche maximal (en mètres) pour $geoNear sur /api/questions/nearby.
// On filtre ensuite chaque question par son propre triggerRadius.
export const MAX_SEARCH_RADIUS = 10000;

export enum Color {
  Black = 33,
  Red = 31,
  Green = 32,
  Yellow = 33,
  Blue = 34,
  Magenta = 35,
  Cyan = 36,
  White = 37,
}
