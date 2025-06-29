import React, { useState, useEffect } from "react";
import { auth, db } from './firebase-config';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

function App(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if(currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists()){
          setUser({ ...currentUser, role: userDoc.data().role});
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
    <div className="app-container">
      {!user ? (
        <>
          <SignUp />
          <hr />
          <Login />
        </>
      ) : (
        <Dashboard user={user} />
      )}
      </div>
  );
}

export default App;