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
    return {};
  }
}

async function writeCategories(categories: CategoryData) {
  await ensureDataDir();
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { subcategories, description }: { subcategories?: string[]; description?: string } = await req.json();
    const categoryName = decodeURIComponent(params.category);

    const categories = await readCategories();
    if (!(categoryName in categories)) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    // Update only provided fields
    if (subcategories !== undefined) {
      if (!Array.isArray(subcategories)) {
        return Response.json({ error: "Invalid subcategories" }, { status: 400 });
      }
      categories[categoryName].subcategories = subcategories;
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return Response.json({ error: "Invalid description" }, { status: 400 });
      }
      categories[categoryName].description = description.trim();
    }

    await writeCategories(categories);

    return Response.json({ message: "Category updated successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const categoryName = decodeURIComponent(params.category);
    const categories = await readCategories();

    if (!(categoryName in categories)) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    delete categories[categoryName];
    await writeCategories(categories);

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
