import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import CreateCourse from './CreateCourse';

const Dashboard = ({ user }) => {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    if (user.role === 'Instructor') {
      const q = query(collection(db, "courses"), where("instructorId", "==", user.uid));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const instructorCourses = [];
        querySnapshot.forEach((doc) => {
          instructorCourses.push({ id: doc.id, ...doc.data() });
        });
        setCourses(instructorCourses);
      });

      return () => unsubscribe();
    }
  }, [user.uid, user.role]);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>MyLMS Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main>
        <h2>Welcome, {user.email}!</h2>
        <p>Your assigned role is: <strong>{user.role}</strong></p>
        <hr/>
        
        {user.role === 'Instructor' && (
          <div>
            <h3>Instructor Tools</h3>
            <CreateCourse />
            <div style={{ marginTop: '2rem' }}>
              <h3>My Created Courses</h3>
              {courses.length > 0 ? (
                <ul>
                  {courses.map(course => (
                    <li key={course.id}>{course.title}</li>
                  ))}
                </ul>
              ) : (
                <p>You have not created any courses yet.</p>
              )}
            </div>
          </div>
        )}

        {user.role === 'Student' && (
          <div>
            <h3>My Courses</h3>
            <p>Here you will eventually see the courses you are enrolled in.</p>
          </div>
        )}

        {user.role === 'Admin' && (
          <div>
            <h3>Admin Panel</h3>
            <p>Here you will eventually manage users and site settings.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;