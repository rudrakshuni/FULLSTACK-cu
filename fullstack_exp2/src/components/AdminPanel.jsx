import {
  ThemeProvider,
  CssBaseline,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { lightTheme, darkTheme } from "../theme";

export default function AdminPanel() {
  const [dark, setDark] = useState(false);

  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <CssBaseline />

      <Button
        variant="contained"
        sx={{ m: 2 }}
        onClick={() => setDark(!dark)}
      >
        Toggle Theme
      </Button>

      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Admin Panel One</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Admin Panel Two</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
