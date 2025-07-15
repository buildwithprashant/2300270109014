import React, { useState } from "react";
import UrlForm from "../components/UrlForm";
import UrlCard from "../components/UrlCard";
import { shortenUrls } from "../services/api";
import { Container, Typography, Snackbar, Alert } from "@mui/material";

const ShortenerPage = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleShorten = async (urls) => {
    try {
      const res = await shortenUrls(urls);
      setResults(res.data); // expect: [{ originalUrl, shortUrl, expiresAt }]
    } catch (err) {
      setError("Something went wrong while shortening the URLs.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      <UrlForm onSubmit={handleShorten} />

      {results.map((result, index) => (
        <UrlCard key={index} data={result} />
      ))}

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ShortenerPage;
