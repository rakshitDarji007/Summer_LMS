// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'; 
import CreateCourse from './CreateCourse';

const Dashboard = ({ user }) => {
  const [instructorCourses, setInstructorCourses] = useState([]);
  // NEW: State to hold the list of ALL available courses for students
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    // --- Logic for Instructors ---
    if (user.role === 'Instructor') {
      const q = query(collection(db, "courses"), where("instructorId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const courses = [];
        querySnapshot.forEach((doc) => {
          courses.push({ id: doc.id, ...doc.data() });
        });
        setInstructorCourses(courses);
      });
      return () => unsubscribe();
    }

    // --- NEW: Logic for Students ---
    if (user.role === 'Student') {
      // Query to get all courses, ordered by creation date
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const courses = [];
        querySnapshot.forEach((doc) => {
          courses.push({ id: doc.id, ...doc.data() });
        });
        setAllCourses(courses);
      });
      return () => unsubscribe();
    }
  }, [user]); // Rerun this effect if the user object changes

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
              {instructorCourses.length > 0 ? (
                <ul>
                  {instructorCourses.map(course => (
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
            <h3>Available Courses</h3>
            {/* NEW: Display all available courses for the student */}
            {allCourses.length > 0 ? (
              allCourses.map(course => (
                <div key={course.id} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <p><small>Instructor: {course.instructorEmail}</small></p>
                  <button>Enroll</button> {/* This button doesn't do anything yet */}
                </div>
              ))
            ) : (
              <p>No courses are available at this time.</p>
            )}
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