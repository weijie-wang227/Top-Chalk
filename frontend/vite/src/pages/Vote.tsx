import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Search } from "lucide-react";
import { X } from "lucide-react";

interface Data {
  id: number;
  name: string;
  faculty: string;
}

interface FilterCategory {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

const API = import.meta.env.VITE_API_BASE_URL;

const filter: FilterCategory[] = [
  {
    id: "1",
    name: "Faculty",
    subcategories: [
      { id: "1", name: "Medicine" },
      { id: "2", name: "Nursing" },
      { id: "3", name: "Business" },
    ],
  },
];

const Vote = () => {
  const [query, setQuery] = useState("");
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [profs, setProfessors] = useState<Data[]>([]);
  const [filterData, setFilterData] = useState<FilterCategory[]>(filter);
  const [selectedFilter, setSelectedFilter] = useState<{
    category: string;
    subcategory: string;
  } | null>(null);

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleClick = (prof: Data) => {
    navigate(`/professor/${prof.id}`);
  };

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await fetch(`${API}/professors`);
        if (!res.ok) throw new Error("Failed to fetch professors");
        const data: Data[] = await res.json();
        setProfessors(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    /*
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://top-chalk-659279002644.asia-southeast1.run.app/faculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data: Data[] = await res.json();
        setFaculties(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    */

    fetchProfessors();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const map: Record<number, string> = {};

      await Promise.all(
        profs.map(async (prof) => {
          try {
            const res = await fetch(`${API}/avatarUrl?id=${prof.id}`, {
              method: "GET",
              credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) {
              console.error("Image error:", data.error);
              map[prof.id] = "/placeholder.jpg";
              throw new Error("Cannot fetch avatar Url");
            }
            map[prof.id] = data.url;
          } catch (err) {
            console.error(`Failed to load image for ${prof.name}`, err);
            map[prof.id] = "/placeholder.jpg";
          }
        })
      );

      setImageMap(map);
    };

    if (profs.length > 0) {
      loadImages();
    }
  }, [profs]);

  const filtered = profs.filter((prof) =>
    prof.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filtered.length > 0) {
      navigate(`/professor/${filtered[0].id}`);
    }
  };

  const handleFilterSelect = (
    categoryName: string,
    subcategoryName: string
  ) => {
    setSelectedFilter({
      category: categoryName,
      subcategory: subcategoryName,
    });
  };

  const clearFilter = () => {
    setSelectedFilter(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <div>
        <Paper elevation={3} sx={{ mb: 3, p: 2, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold">
            Choose your Professor
          </Typography>
        </Paper>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          {/* Search Bar */}
          <TextField
            label="Search Professors"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: "250px" }}
          />

          {/* Filter Button Dropdown */}
          <div className="relative inline-block">
            <div className="group">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ease-in-out hover:bg-green-200 hover:border-green-700 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  selectedFilter
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <span className="font-medium">
                  {selectedFilter
                    ? `${selectedFilter.category}: ${selectedFilter.subcategory}`
                    : "Filter"}
                </span>
                {selectedFilter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter();
                    }}
                    className="ml-1 p-0.5 hover:bg-green-200 rounded transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>

              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                {filterData.map((category) => (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between group/item">
                      <span className="text-gray-700 font-medium">
                        {category.name}
                      </span>
                    </div>

                    {hoveredCategory === category.id && (
                      <div className="absolute right-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                        {category.subcategories.map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={() =>
                              handleFilterSelect(
                                category.name,
                                subcategory.name
                              )
                            }
                            className="w-full px-4 py-2.5 text-left hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-100 last:border-b-0 text-gray-600 text-sm"
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {query === "" ? (
        selectedFilter !== null ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "center",
            }}
          >
            {profs
              .filter((prof) => prof.faculty === selectedFilter?.subcategory)
              .map((prof) => (
                <Box
                  key={prof.id}
                  sx={{
                    width: { xs: "100%", sm: "45%", md: "30%" },
                    flexGrow: 1,
                  }}
                  onClick={() => handleClick(prof)}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <img
                          src={imageMap[prof.id] || "/placeholder.jpg"}
                          alt="Professor"
                          style={{
                            width: "100%",
                            maxWidth: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {prof.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Faculty: {prof.faculty}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        ) : profs.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "center",
            }}
          >
            {profs.map((prof) => (
              <Box
                key={prof.id}
                sx={{
                  width: { xs: "100%", sm: "45%", md: "30%" },
                  flexGrow: 1,
                }}
                onClick={() => handleClick(prof)}
              >
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 },
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <img
                        src={imageMap[prof.id] || "/placeholder.jpg"}
                        alt="Professor"
                        style={{
                          width: "100%",
                          maxWidth: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {prof.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Faculty: {prof.faculty}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
            No results found
          </Typography>
        )
      ) : filtered.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {filtered.map((prof) => (
            <Box
              key={prof.id}
              sx={{
                width: { xs: "100%", sm: "45%", md: "30%" },
                flexGrow: 1,
              }}
              onClick={() => handleClick(prof)}
            >
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 },
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <img
                      src={imageMap[prof.id] || "/placeholder.jpg"}
                      alt="Professor"
                      style={{
                        width: "100%",
                        maxWidth: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {prof.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Faculty: {prof.faculty}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
          No results found
        </Typography>
      )}
    </Box>
  );
};

export default Vote;
