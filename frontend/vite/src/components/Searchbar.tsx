import { Box, TextField, Typography } from "@mui/material";
import { useState } from "react";

interface SearchProps {
  names: string[];
  onSelectName: (name: string) => void;
}

const Searchbar = ({ names, onSelectName }: SearchProps) => {
  const [query, setQuery] = useState("");

  // Filter professors by name including the query (case-insensitive)
  const filtered = names.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // On Enter, if query matches any professor exactly, call onSelectName
      if (filtered.length) {
        onSelectName(filtered[0]);
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search Professors"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Box mt={2}>
        {filtered.length ? (
          query.length > 0 ? (
            filtered.map((name) => (
              <Typography key={name} variant="body1">
                {name}
              </Typography>
            ))
          ) : null
        ) : (
          <Typography>No results found</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Searchbar;
