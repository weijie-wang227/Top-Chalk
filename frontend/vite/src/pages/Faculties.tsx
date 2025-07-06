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

const Faculties = () => {
  const [faculties, setFaculties] = useState<Data[]>([]);
  // Map category id to array of teachers
  const [topProfs, setTopProfs] = useState<Record<number, Teacher[]>>({});

  useEffect(() => {
    const fetchFacultiesAndTopProfs = async () => {
      try {
        const res = await fetch("https://top-chalk-659279002644.asia-southeast1.run.app/faculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");

        const data: Data[] = await res.json();
        setFaculties(data);

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

    fetchFacultiesAndTopProfs();
  }, []);

  // Separate function to fetch top 3 professors for a category
  const fetchTop3Professors = async (facultyId: number): Promise<Teacher[]> => {
    try {
      const res = await fetch(
        `https://top-chalk-659279002644.asia-southeast1.run.app/top3faculties?faculty_id=${facultyId}`
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
            Faculty Rankings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the top 3 professors in each faculty, ranked by votes from
            students like you.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {faculties.map((faculty) => {
            const items = topProfs[faculty.id];
            if (!items || items.length === 0) return null;

            return (
              <div key={faculty.id} className="w-full max-w-3xl">
                <Section title={faculty.name} items={items} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Faculties;
