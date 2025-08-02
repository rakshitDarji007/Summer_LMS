import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { Container, Grid, Paper, Box, Typography } from '@mui/material';

import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import CourseDetail from './pages/CourseDetail';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...currentUser, role: userDoc.data().role });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={
        !user ? <Navigate to="/login" /> : <Dashboard user={user} />
      } />
      
      <Route path="/login" element={
        user ? <Navigate to="/" /> : (
          <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" align="center" gutterBottom>
                Welcome to MyLMS
              </Typography>
              <Grid container spacing={4} alignItems="flex-start">
                <Grid item xs={12} sm={6}>
                  <SignUp />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Login />
                </Grid>
              </Grid>
            </Paper>
          </Container>
        )
      } />

      <Route path="/course/:courseId" element={
        !user ? <Navigate to="/login" /> : <CourseDetail user={user} />
      } />
    </Routes>
  );
}

export default App;