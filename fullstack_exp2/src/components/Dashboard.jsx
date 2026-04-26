import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar toggleSidebar={() => setOpen(!open)} />

      {open && <Sidebar />}

      <Box sx={{ flexGrow: 1, mt: 8, p: 3 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Card {item}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
