import { Color } from "../constants";

export const logColor = (message: string, color: Color) => {
  console.log(`\x1b[${color}m${message}\x1b[0m`);
};

export const logBasic = (message: string) => {
  logColor(`${message}`, Color.White);
};

export const logSuccess = (message: string) => {
  logColor(`✔ ${message}`, Color.Green);
};

export const logInfo = (message: string) => {
  logColor(`🛈 ${message}`, Color.Yellow);
};

export const logError = (message: string) => {
  logColor(`✖ ${message}`, Color.Red);
};
