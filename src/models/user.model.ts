import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

/**
 * Collection `users` (cf. spec 10.1).
 * Le mot de passe n'est jamais stocké en clair : on conserve le hash + le salt
 * (générés par `generatePassword` dans helpers/auth.ts) ainsi qu'un token
 * d'authentification régénéré à chaque connexion.
 */
const userSchema = new Schema({
  nom: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  token: { type: String, required: true },
  dateCreation: { type: Date, default: Date.now },
});

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const UserModel = model("User", userSchema);
