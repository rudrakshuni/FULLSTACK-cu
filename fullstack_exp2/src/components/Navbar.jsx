import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar({ toggleSidebar }) {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton color="inherit" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2 }}>
          Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
