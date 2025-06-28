import { Box } from "@mui/material";
import Section from "../components/Section";
import { useState } from "react";
import { useEffect } from "react";

interface Data {
  id: number;
  name: string;
}

interface Teacher extends Data {
  votes: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Data[]>([]);
  // Map category id to array of teachers
  const [topProfs, setTopProfs] = useState<Record<number, Teacher[]>>({});

  useEffect(() => {
    const fetchCategoriesAndTopProfs = async () => {
      try {
        const res = await fetch("http://localhost:8080/categoriesUp");
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data: Data[] = await res.json();
        setCategories(data);

        // Fetch top 3 professors for each category in parallel
        const profMapEntries = await Promise.all(
          data.map(async (category) => {
            const profs = await fetchTop3Professors(category.id);
            return [category.id, profs] as [number, Teacher[]];
          })
        );

        // Convert to object and set once
        const profMap = Object.fromEntries(profMapEntries);
        setTopProfs(profMap);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchCategoriesAndTopProfs();
  }, []);

  // Separate function to fetch top 3 professors for a category
  const fetchTop3Professors = async (
    categoryId: number
  ): Promise<Teacher[]> => {
    try {
      const res = await fetch(
        `http://localhost:8080/top3categories?category_id=${categoryId}`
      );
      if (!res.ok) throw new Error("Failed to fetch top professors");
      const data: Teacher[] = await res.json();
      return data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Category Rankings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See which professors are leading in specific categories like
            helpfulness, humor, and inspiration.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {categories.map((category) => {
            const items = topProfs[category.id];
            if (!items || items.length === 0) return null;

            return (
              <div key={category.id} className="w-full max-w-3xl">
                <Section title={category.name} items={items} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
