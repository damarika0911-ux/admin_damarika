import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React from "react";

const ServiceUnavailablePage: React.FC = () => {
  const colors = {
    primary: "#8B4513",
    background: "#FAF7F2",
    white: "#FFFFFF",
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: colors.primary,
      },
      background: {
        default: colors.background,
      },
    },
    typography: {
      h1: {
        fontWeight: 600,
        color: colors.primary,
      },
      h4: {
        color: colors.primary,
      },
      body1: {
        color: colors.primary,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: "none",
            padding: "10px 24px",
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background,
            boxShadow: "none",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          component={motion.main}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            py: 6,
          }}
        >
          {/* Animated GIF */}
          {/* <motion.img
            src={maintenanceGif}
            alt="Under maintenance"
            style={{
              maxWidth: "220px",
              margin: "0 auto 30px",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          /> */}

          <Typography
            variant="h1"
            component={motion.h1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            sx={{
              mb: 4,
              fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
            }}
          >
            Service Temporarily Unavailable
          </Typography>

          <Typography
            variant="h5"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            sx={{
              mb: 5,
              color: colors.primary,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            We're currently performing maintenance on our archaeological
            gateway. Please check back soon.
          </Typography>

          <Typography
            variant="body1"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            sx={{
              mb: 6,
              fontSize: "1.2rem",
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            Creating a positive society, sensitive to history and heritage
          </Typography>

          <Grid
            container
            spacing={2}
            justifyContent="center"
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            sx={{ mb: 4 }}
          >
            <Grid>
              <Button variant="contained" color="primary" size="large">
                Try Again
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                sx={{ backgroundColor: "#ffffff", color: "#000000" }}
              >
                Contact Us
              </Button>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: "center",
            color: colors.primary,
          }}
        >
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Damarika. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ServiceUnavailablePage;
