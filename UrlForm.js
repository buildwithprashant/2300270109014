import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";

const UrlForm = ({ onSubmit }) => {
  const [inputs, setInputs] = useState([{ url: "", validity: "", shortcode: "" }]);

  const handleChange = (index, field, value) => {
    const updated = [...inputs];
    updated[index][field] = value;
    setInputs(updated);
  };

  const addField = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { url: "", validity: "", shortcode: "" }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  return (
    <form onSubmit={handleSubmit}>
      {inputs.map((input, idx) => (
        <Box key={idx} display="flex" gap={2} mb={2}>
          <TextField
            label="Original URL"
            required
            fullWidth
            value={input.url}
            onChange={(e) => handleChange(idx, "url", e.target.value)}
          />
          <TextField
            label="Validity (min)"
            type="number"
            value={input.validity}
            onChange={(e) => handleChange(idx, "validity", e.target.value)}
          />
          <TextField
            label="Shortcode"
            value={input.shortcode}
            onChange={(e) => handleChange(idx, "shortcode", e.target.value)}
          />
        </Box>
      ))}
      <Button onClick={addField} disabled={inputs.length >= 5}>Add More</Button>
      <Button type="submit" variant="contained" sx={{ ml: 2 }}>
        Shorten URLs
      </Button>
    </form>
  );
};

export default UrlForm;
