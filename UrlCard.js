import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const UrlCard = ({ data }) => {
  return (
    <Card sx={{ my: 2 }}>
      <CardContent>
        <Typography>Original: {data.originalUrl}</Typography>
        <Typography>
          Short: <a href={data.shortUrl}>{data.shortUrl}</a>
        </Typography>
        <Typography>Expires At: {data.expiresAt}</Typography>
      </CardContent>
    </Card>
  );
};

export default UrlCard;
