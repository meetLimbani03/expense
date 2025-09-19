import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

interface CategoryData {
  [category: string]: {
    subcategories: string[];
    description: string;
  };
}

const CATEGORIES_FILE = path.join(process.cwd(), "data", "categories.json");

// Default categories with detailed descriptions for better semantic matching
const DEFAULT_CATEGORIES: CategoryData = {
  Food: {
    subcategories: ["Dinner", "Lunch", "Breakfast", "Snacks", "Coffee", "Groceries"],
    description: "Food and dining expenses including restaurant meals, groceries, snacks, coffee shops, and food delivery services."
  },
  Travel: {
    subcategories: ["Taxi", "Bus", "Train", "Flight", "Fuel", "Parking"],
    description: "Transportation and travel costs including taxis, public transit, flights, fuel, parking fees, and travel-related expenses."
  },
  Entertainment: {
    subcategories: ["Movies", "Games", "Events", "Subscriptions"],
    description: "Entertainment and leisure activities including movie tickets, video games, concerts, events, and subscription services like streaming platforms."
  },
  Shopping: {
    subcategories: ["Clothing", "Electronics", "Home", "Gifts"],
    description: "Retail purchases including clothing, electronics, home goods, furniture, and gifts for personal or professional use."
  },
  Utilities: {
    subcategories: ["Electricity", "Water", "Internet", "Gas", "Phone"],
    description: "Essential utility bills and services including electricity, water, internet connectivity, gas, and mobile phone charges."
  },
  Health: {
    subcategories: ["Medicines", "Doctor", "Fitness"],
    description: "Healthcare and wellness expenses including prescription medicines, doctor visits, medical treatments, and fitness memberships."
  },
  Education: {
    subcategories: ["Courses", "Books", "Supplies"],
    description: "Educational expenses including online courses, textbooks, learning materials, school supplies, and professional development."
  },
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readCategories(): Promise<CategoryData> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CATEGORIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return defaults if file doesn't exist
    return { ...DEFAULT_CATEGORIES };
  }
}

async function writeCategories(categories: CategoryData) {
  await ensureDataDir();
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

export async function GET() {
  try {
    const categories = await readCategories();
    return Response.json(categories);
  } catch (error) {
    return Response.json({ error: "Failed to read categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, subcategories, description }: {
      category: string;
      subcategories: string[];
      description: string;
    } = await req.json();

    if (!category || !Array.isArray(subcategories) || !description) {
      return Response.json({ error: "Invalid category, subcategories, or description" }, { status: 400 });
    }

    const categories = await readCategories();
    categories[category] = { subcategories, description };
    await writeCategories(categories);

    return Response.json({ message: "Category added successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to add category" }, { status: 500 });
  }
}
