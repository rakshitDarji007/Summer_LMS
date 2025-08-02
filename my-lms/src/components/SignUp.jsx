import React, { useState } from 'react';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: new Date()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSignUp}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Typography variant="h5">Create Account</Typography>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <FormControl fullWidth>
        <InputLabel>I am a...</InputLabel>
        <Select
          value={role}
          label="I am a..."
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="Student">Student</MenuItem>
          <MenuItem value="Instructor">Instructor</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="secondary">
        Sign Up
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default SignUp;