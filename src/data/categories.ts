import Category from "../models/Category";

export const seedCategories = async () => {
  try {
    const categoriesData = [
      {
        name: "Elite Trainer Box (ETB)",
        description:
          "Elite Trainer Boxes with booster packs, accessories and premium items",
        icon: "�",
      },
      {
        name: "Premium Collection",
        description:
          "Premium collections with exclusive cards and collectibles",
        icon: "✨",
      },
      {
        name: "Booster Packs",
        description: "Individual booster packs from various sets",
        icon: "🃏",
      },
      {
        name: "Single Cards",
        description: "Individual Pokemon cards and rare collectibles",
        icon: "🎯",
      },
      {
        name: "Theme Decks",
        description: "Pre-constructed theme decks ready to play",
        icon: "🎴",
      },
      {
        name: "Collection Boxes",
        description: "Special collection boxes and promotional sets",
        icon: "🎁",
      },
      {
        name: "Accessories",
        description: "Card sleeves, playmats, deck boxes and other accessories",
        icon: "🛡️",
      },
    ];

    for (const categoryData of categoriesData) {
      await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData,
      });
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};
