import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NotesCanvas from "../components/NotesCanvas";

import {
  Box,
  Button,
  Chip,
  Stack,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Card,
  Divider,
  CardMedia,
} from "@mui/material";

interface Data {
  id: number;
  name: string;
  faculty: string;
}

const ProfessorPage = () => {
  const { id } = useParams();
  const [professor, setProfessor] = useState<Data>({
    id: -1,
    name: "Loading...",
    faculty: "...",
  });

  const [selectedCategory, setCategory] = useState(0);
  const [allCategories, setCategories] = useState<Data[]>([]);

  const [selectedDownCategory, setDownCategory] = useState(1);
  const [selectedSubCategory, setSubCategory] = useState(0);
  const [allDownCategories, setDownCategories] = useState<Data[]>([]);
  const [allSubCategories, setSubCategories] = useState<Data[]>([]);
  const [image, setImage] = useState("");
  const [studentId, setStudentId] = useState(-1);
  const [cannotUpvote, setUpvote] = useState(false);
  const [cannotDownvote, setDownvote] = useState(false);
  const [kudosCanvas, setKudosCanvas] = useState(false);

  const onSelectCategory = (id: number) => setCategory(id);
  const onSelectDownCategory = (id: number) => setDownCategory(id);
  const onSelectSubCategory = (id: number) => setSubCategory(id);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://top-chalk-659279002644.asia-southeast1.run.app/categoriesUp"
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Data[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    const fetchCategoriesDown = async () => {
      try {
        const res = await fetch(
          "https://top-chalk-659279002644.asia-southeast1.run.app/categoriesDown"
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Data[] = await res.json();
        setDownCategories(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    const fetchInfo = async () => {
      try {
        const res = await fetch(
          `https://top-chalk-659279002644.asia-southeast1.run.app/info?profId=${id}`
        );
        if (!res.ok) throw new Error("Unable to fetch info");
        const info: Data = await res.json();
        setProfessor(info);
      } catch (err) {
        console.log("Error:", err);
      }
    };

    const fetchImage = async () => {
      try {
        console.log(id);
        const res = await fetch(
          `https://top-chalk-659279002644.asia-southeast1.run.app/avatarUrl?id=${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("Image error:", data.error);
          setImage("/placeholder.jpg");
          throw new Error("Cannot fetch avatar Url");
        }
        setImage(data.url);
      } catch (err) {
        console.error(`Failed to load image for ${professor.name}`, err);
        setImage("/placeholder.jpg");
      }
    };

    fetchCategories();
    fetchCategoriesDown();
    fetchInfo();
    fetchImage();
  }, [id]);

  useEffect(() => {
    if (studentId != -1) {
      const fetchCanVote = async () => {
        try {
          const res = await fetch(
            `https://top-chalk-659279002644.asia-southeast1.run.app/checkVote?studentId=${studentId}&teacherId=${id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            console.error("Check votes:", data.error);
            throw new Error("Cannot check votes");
          }
          setUpvote(data.upvote);
          setDownvote(data.downvote);
        } catch (err) {
          console.error(`Failed to load image for ${professor.name}`, err);
          setImage("/placeholder.jpg");
        }
      };

      fetchCanVote();
    }
  }, [studentId]);

  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const res = await fetch(
          "https://top-chalk-659279002644.asia-southeast1.run.app/auth/request",
          {
            method: "GET",
            credentials: "include", // include session cookie
          }
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("Auth error:", data.error);
          throw new Error("Not authenticated");
        }
        setStudentId(data.userId);
      } catch (err) {
        console.error(`Failed to get userId`, err);
      }
    };
    fetchStudentId();
  }, []);

  useEffect(() => {
    const fetchSubCat = async () => {
      try {
        const res = await fetch(
          `https://top-chalk-659279002644.asia-southeast1.run.app/subcategories?category_id=${encodeURIComponent(
            selectedDownCategory
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch downvotes");
        const data: Data[] = await res.json();
        setSubCategories(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchSubCat();
  }, [selectedDownCategory]);

  const handleUpVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const profId = professor.id;
    const response = await fetch(
      "https://top-chalk-659279002644.asia-southeast1.run.app/upvote",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profId, studentId, selectedCategory }),
      }
    );
    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      console.log(data.message);
      setUpvote(true);
    } else {
      console.log("Vote failed");
    }
  };

  const handleKudosCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    setKudosCanvas(true);
  };

  const handleDownVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const profId = professor.id;
    const response = await fetch(
      "https://top-chalk-659279002644.asia-southeast1.run.app/downvote",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profId, studentId, selectedSubCategory }),
      }
    );

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      setDownvote(true);
    } else {
      console.log("Vote failed");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card
        sx={{
          p: 4,
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={professor.name}
          sx={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {professor.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Faculty: {professor.faculty}
          </Typography>
        </Box>
      </Card>

      {/* Upvote Section */}
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Positive Feedback
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
        >
          {allCategories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              variant="filled"
              color={selectedCategory === category.id ? "primary" : "default"}
              onClick={() => onSelectCategory(category.id)}
              clickable
              sx={{ m: 1 }}
            />
          ))}
        </Stack>
        {!cannotUpvote && (
          <Box textAlign="center" mt={3}>
            {!kudosCanvas ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleKudosCanvas}
              >
                Add Kudos Note?
              </Button>
            ) : (
              <NotesCanvas studentId={studentId} teacherId={professor.id} />
            )}
          </Box>
        )}
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            size="large"
            disabled={selectedCategory === 0 || cannotUpvote}
            onClick={handleUpVote}
          >
            Submit Upvote
          </Button>

          {cannotUpvote && (
            <Typography color="text.secondary">Already Upvoted</Typography>
          )}
        </Box>
      </Card>

      {/* Downvote Section */}
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Complaints / Negative Feedback
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
          mb={3}
        >
          {allDownCategories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              variant="filled"
              color={
                selectedDownCategory === category.id ? "primary" : "default"
              }
              onClick={() => onSelectDownCategory(category.id)}
              clickable
              sx={{ m: 1 }}
            />
          ))}
        </Stack>
        <FormControl fullWidth>
          <InputLabel>Select Complaint</InputLabel>
          <Select
            value={selectedSubCategory || ""}
            label="Select Complaint"
            onChange={(event) => onSelectSubCategory(event.target.value)}
          >
            {allSubCategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            size="large"
            disabled={selectedSubCategory === 0 || cannotDownvote}
            onClick={handleDownVote}
          >
            Submit Downvote
          </Button>
          {cannotDownvote && (
            <Typography color="text.secondary">Already Downvoted</Typography>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default ProfessorPage;
