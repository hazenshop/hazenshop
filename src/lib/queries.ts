import { cache } from "react";
import { db } from "./db";

/**
 * Per-request deduplicated data loaders using React cache().
 * Ensures generateMetadata, RootLayout, and page components share
 * a single Supabase query per request while always serving fresh data.
 */
export const getCachedSettings = cache(() => db.getSettings());
export const getCachedCategories = cache(() => db.getCategories());
export const getCachedProducts = cache(() => db.getProducts());
