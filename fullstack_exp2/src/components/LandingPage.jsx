import { Container, Grid, Typography, Box } from "@mui/material";

export default function LandingPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 12 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Responsive Landing Page
          </Typography>
          <Typography>
            This layout stacks on mobile and appears side by side on larger screens.
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 200,
              backgroundColor: "primary.main",
              borderRadius: 2,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
