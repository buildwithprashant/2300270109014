import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const RedirectPage = () => {
  const { shortcode } = useParams();

  useEffect(() => {
    const redirect = async () => {
      const res = await fetch(`/api/redirect/${shortcode}`);
      const data = await res.json();
      if (data.originalUrl) {
        window.location.href = data.originalUrl;
      } else {
        alert("Invalid or expired shortcode.");
      }
    };
    redirect();
  }, [shortcode]);

  return <p>Redirecting...</p>;
};

export default RedirectPage;

