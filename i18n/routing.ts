import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "ar", "fr"],
  // Used when no locale matches
  defaultLocale: "ar",
});

export type Locale = (typeof routing.locales)[number];
