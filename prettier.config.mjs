import base from "./packages/config/prettier.config.js";

/** @type {import('prettier').Config} */
export default {
  ...base,
  tailwindStylesheet: "./apps/app/src/styles/globals.css",
};
