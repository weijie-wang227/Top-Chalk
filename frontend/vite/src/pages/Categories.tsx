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
    <Box>
      {categories.map((category) => {
        const items = topProfs[category.id];
        if (!items || items.length === 0) return null; // Skip if not ready or empty

        return (
          <Section key={category.id} title={category.name} items={items} />
        );
      })}
    </Box>
  );
};

export default Categories;
