import { createCategoryLayout } from "@/lib/category-layout";

// 노출 범위(lib/sites.ts SITE_CATEGORY_SEGMENTS) 밖이면 404 — 근거는 createCategoryLayout 주석.
export default createCategoryLayout("artists");
