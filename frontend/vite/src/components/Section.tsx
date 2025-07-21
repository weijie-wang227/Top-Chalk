import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { useEffect, useState } from "react";

interface SectionProps {
  title: string;
  items: Array<{ name: string; votes: number; id: number; streak: number }>;
}

const API = import.meta.env.VITE_API_BASE_URL;

const Section = ({ title, items }: SectionProps) => {
  const textVariants = ["h4", "h5", "h6"] as const;

  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAllAvatars = async () => {
      const urls: Record<string, string> = {};
      await Promise.all(
        items.map(async (prof) => {
          try {
            const res = await fetch(
              `${API}/avatarUrl?id=${prof.id}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const data = await res.json();
            if (res.ok && data.url) {
              urls[prof.id] = data.url;
            } else {
              // Assign empty string if URL is not valid
              urls[prof.id] = "";
            }
          } catch (err) {
            console.error("fetch Url failed:", err);
            urls[prof.id] = ""; // Also assign empty string on error
          }
        })
      );
      setAvatarUrls(urls);
    };

    fetchAllAvatars();
  }, [items]);

  return (
    <>
      {items && items.length > 0 && (
        <Card
          sx={{
            p: 3,
            my: 3,
            boxShadow: 3,
            borderRadius: 3,
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": { boxShadow: 8 },
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 3,
              letterSpacing: 1,
            }}
          >
            {title}
          </Typography>
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.slice(0, 3).map((prof, index) => {
                const bgColors = [
                  "rgba(255, 215, 0, 0.15)", // Gold
                  "rgba(192, 192, 192, 0.15)", // Silver
                  "rgba(205, 127, 50, 0.15)", // Bronze
                ];
                const borderColors = [
                  "#FFD700", // Gold
                  "#C0C0C0", // Silver
                  "#CD7F32", // Bronze
                ];

                const initials = prof.name.charAt(0).toUpperCase();

                return (
                  <Box
                    key={title + prof.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: bgColors[index],
                      border: `2px solid ${borderColors[index]}`,
                      transition: "background-color 0.3s",
                      "&:hover": {
                        backgroundColor: bgColors[index].replace(
                          "0.15",
                          "0.25"
                        ),
                        cursor: "default",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={avatarUrls[prof.id] || undefined}
                        alt={prof.name}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: borderColors[index],
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        {!avatarUrls[prof.id] && initials}
                      </Avatar>
                      <Typography
                        variant={textVariants[index]}
                        sx={{
                          fontWeight: index === 0 ? "bold" : 600,
                          color: "text.primary",
                        }}
                      >
                        {index + 1}. {prof.name}{" "}
                        {prof.streak > 2 && `🔥${prof.streak}`}
                      </Typography>
                    </Box>
                    <Typography
                      variant={textVariants[index]}
                      sx={{
                        fontWeight: index === 0 ? "bold" : 600,
                        color: "text.primary",
                      }}
                    >
                      Votes: {prof.votes}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Section;
