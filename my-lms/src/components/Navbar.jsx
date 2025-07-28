import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';

const Navbar = ({ user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MyLMS
        </Typography>
        {user && (
          <>
            <Typography sx={{ mr: 2 }}>
              Welcome, {user.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;