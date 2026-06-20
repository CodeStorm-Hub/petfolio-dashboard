export const PRODUCT_CATEGORIES = [
  { value: "food",     label: "Food" },
  { value: "gear",     label: "Gear" },
  { value: "toys",     label: "Toys" },
  { value: "treats",   label: "Treats" },
  { value: "health",   label: "Health" },
  { value: "grooming", label: "Grooming" },
  { value: "beds",     label: "Beds" },
  { value: "apparel",  label: "Apparel" },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["value"];
