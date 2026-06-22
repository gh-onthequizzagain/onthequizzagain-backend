import SHA256 from "crypto-js/sha256";
import encBase64 from "crypto-js/enc-base64";
import uid2 from "uid2";

export type Password = { hash: string; salt: string; token: string };

export const generatePassword = (password: string, salt?: string): Password => {
  const useSalt = !salt ? uid2(16) : salt;
  const hash = SHA256(password + useSalt).toString(encBase64);
  const token = uid2(64);

  return { hash, salt: useSalt, token };
};
