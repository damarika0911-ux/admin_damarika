import { Box, Typography } from "@mui/material";

const GlobalLoader = ({ isLoading = false }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      {/* Animated spinner */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "3px solid #E8D5C4",
          borderTopColor: "#8B4513",
          animation: "spin 0.8s linear infinite",
          "@keyframes spin": {
            to: { transform: "rotate(360deg)" },
          },
        }}
      />

      <Typography
        sx={{
          mt: 2.5,
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "#5D4037",
          letterSpacing: "0.05em",
        }}
      >
        Loading...
      </Typography>

      {/* Progress bar */}
      <Box
        sx={{
          mt: 1.5,
          width: 100,
          height: 3,
          backgroundColor: "#E8D5C4",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "40%",
            backgroundColor: "#8B4513",
            borderRadius: 2,
            animation: "slide 1.2s ease-in-out infinite",
            "@keyframes slide": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(350%)" },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default GlobalLoader;