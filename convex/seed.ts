import { mutation } from "./_generated/server";

// Seed properties data
export const seedProperties = mutation({
  handler: async (ctx) => {
    // Check if properties already exist
    const existingProperties = await ctx.db.query("properties").collect();
    if (existingProperties.length > 0) {
      return {
        message: "Properties already seeded",
        count: existingProperties.length,
      };
    }

    // Sample properties data
    const properties = [
      {
        name: "Apartment 4B",
        description: "Spacious 2-bedroom apartment with city view",
        type: "apartment",
        address: "123 Main St, Apt 4B",
        pricePerDay: 75,
        pricePerMonth: 1200,
        floor: "Floor 1",

        isAvailable: true,
      },
      {
        name: "Office Space 101",
        description: "Modern office space with meeting rooms",
        type: "office",
        address: "456 Business Ave, Suite 101",
        pricePerDay: 150,
        pricePerMonth: 2500,
        isAvailable: true,
        floor: "Floor 1",
      },
      {
        name: "Storage Unit #42",
        description: "Secure storage unit with 24/7 access",
        type: "storage",
        address: "789 Storage Blvd, Unit 42",
        pricePerDay: 10,
        pricePerMonth: 150,
        isAvailable: true,
        floor: "Floor 1",
      },
      {
        name: "Parking Space P12",
        description: "Covered parking space in downtown area",
        type: "parking",
        address: "321 Center St, Space P12",
        pricePerDay: 5,
        pricePerMonth: 75,
        floor: "Floor 1",

        isAvailable: true,
      },
      {
        name: "Conference Room",
        description: "Large conference room with A/V equipment",
        type: "conference",
        address: "456 Business Ave, Room 200",
        pricePerDay: 200,
        pricePerMonth: 677,
        floor: "Floor 1",

        isAvailable: true,
      },
      {
        name: "Studio Apartment 2A",
        description: "Cozy studio apartment near downtown",
        type: "apartment",
        address: "555 Park Ave, Apt 2A",
        pricePerDay: 60,
        floor: "Floor 1",

        pricePerMonth: 950,
        isAvailable: true,
      },
      {
        name: "Retail Space 305",
        description: "Prime retail location with high foot traffic",
        type: "retail",
        floor: "Floor 1",
        address: "777 Shopping St, Unit 305",
        pricePerDay: 200,
        pricePerMonth: 3500,
        isAvailable: true,
      },
    ];

    // Insert properties
    for (const property of properties) {
      await ctx.db.insert("properties", property);
    }

    return {
      message: "Properties seeded successfully",
      count: properties.length,
    };
  },
});

export const seedMenuItems = mutation({
  handler: async (ctx) => {
    // Check if menu items already exist
    const existingMenuItems = await ctx.db.query("menuItems").collect();
    if (existingMenuItems.length > 0) {
      return {
        message: "Menu items already seeded",
        count: existingMenuItems.length,
      };
    }

    // Sample menu items data
    const menuItems = [
      // Food items
      {
        name: "Rice",
        price: 7500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Steamed white rice",
      },
      {
        name: "Grilled Chicken",
        price: 500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Marinated grilled chicken",
      },
      {
        name: "Beef",
        price: 7500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Grilled beef",
      },
      {
        name: "Shawarma",
        price: 8000,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Wrapped meat with vegetables",
      },
      {
        name: "Jollof Rice",
        price: 8500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Spicy rice dish",
      },
      {
        name: "Fried Rice",
        price: 8500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Rice stir-fried with vegetables",
      },
      {
        name: "Plantain",
        price: 2000,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Fried sweet plantains",
      },
      {
        name: "Salad",
        price: 1500,
        category: "food",
        image: "/placeholder.svg?height=50&width=50",
        description: "Fresh vegetable salad",
      },

      // Drink items
      {
        name: "Water",
        price: 1000,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Bottled water",
      },
      {
        name: "Soda",
        price: 1500,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Carbonated soft drink",
      },
      {
        name: "Juice",
        price: 2000,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Fresh fruit juice",
      },
      {
        name: "Beer",
        price: 3500,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Chilled beer",
      },
      {
        name: "Wine",
        price: 5000,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Red or white wine",
      },
      {
        name: "Cocktail",
        price: 4500,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Mixed alcoholic beverage",
      },
      {
        name: "Coffee",
        price: 2500,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Hot brewed coffee",
      },
      {
        name: "Tea",
        price: 2000,
        category: "drink",
        image: "/placeholder.svg?height=50&width=50",
        description: "Hot tea",
      },
    ];

    // Insert menu items
    for (const item of menuItems) {
      await ctx.db.insert("menuItems", item);
    }

    return {
      message: "Menu items seeded successfully",
      count: menuItems.length,
    };
  },
});
