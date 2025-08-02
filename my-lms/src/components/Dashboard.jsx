import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';
import CreateCourse from './CreateCourse';
import Navbar from './Navbar';
import { Container, Typography, Paper, Grid } from '@mui/material';

const Dashboard = ({ user }) => {
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    if (user.role === 'Instructor') {
      const q = query(collection(db, "courses"), where("instructorId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => setInstructorCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      return () => unsubscribe();
    }
    if (user.role === 'Student') {
      const allCoursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const unsubscribeAll = onSnapshot(allCoursesQuery, (snapshot) => setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      
      const enrollmentsQuery = query(collection(db, "enrollments"), where("studentId", "==", user.uid));
      const unsubscribeEnrolled = onSnapshot(enrollmentsQuery, async (enrollmentSnapshot) => {
        const coursePromises = enrollmentSnapshot.docs.map(enrollDoc => getDoc(doc(db, "courses", enrollDoc.data().courseId)));
        const courseDocs = await Promise.all(coursePromises);
        setEnrolledCourses(courseDocs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubscribeAll(); unsubscribeEnrolled(); };
    }
  }, [user]);

  const enrolledCourseIds = enrolledCourses.map(c => c.id);
  const filteredAvailableCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));

  return (
    <>
      <Navbar user={user} />
      <Container sx={{ mt: 4 }}>
        <main>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your assigned role is: <strong>{user.role}</strong>
          </Typography>

          {user.role === 'Instructor' && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom>Instructor Tools</Typography>
                  <CreateCourse />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom>My Created Courses</Typography>
                  {instructorCourses.length > 0 ? (
                    <ul>
                      {instructorCourses.map(course => (
                        <li key={course.id}>
                          <Link to={`/course/${course.id}`}>{course.title}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : <p>You have not created any courses yet.</p>}
                </Paper>
              </Grid>
            </Grid>
          )}

          {user.role === 'Student' && (
            <>
              <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="h5" gutterBottom>My Enrolled Courses</Typography>
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map(course => (
                    <div key={course.id}>
                      <h4><Link to={`/course/${course.id}`}>{course.title}</Link></h4>
                      <p><small>Instructor: {course.instructorEmail}</small></p>
                    </div>
                  ))
                ) : <p>You have not enrolled in any courses yet.</p>}
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>Available Courses</Typography>
                {filteredAvailableCourses.length > 0 ? (
                  filteredAvailableCourses.map(course => (
                    <div key={course.id}>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      <p><small>Instructor: {course.instructorEmail}</small></p>
                      <button onClick={() => alert('Enrollment logic to be updated')}>Enroll</button>
                    </div>
                  ))
                ) : <p>No new courses are available for enrollment.</p>}
              </Paper>
            </>
          )}
        </main>
      </Container>
    </>
  );
};

export default Dashboard;