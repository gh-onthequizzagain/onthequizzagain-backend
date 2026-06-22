//export const PORT_SERVER = process.env.PORT;
export const PORT_SERVER = 3000;

export const PORT_BD = 27017;
// Par défaut : instance MongoDB locale. Surchargeable via la variable d'env URI_BD.
export const URI_BD = process.env.URI_BD ?? `mongodb://localhost:${PORT_BD}`;

// Nom de la base de données utilisée par connectDB().
export const DB_NAME = process.env.DB_NAME ?? "onthequizzagain";

// Rayon de recherche maximal (en mètres) pour /api/questions/nearby.
// Au-delà, on ne va pas chercher de point d'intérêt : le filtrage fin se fait
// ensuite question par question via leur `rayonDeclenchement`.
export const MAX_SEARCH_RADIUS = 50_000;

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
