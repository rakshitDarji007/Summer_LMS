import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc, setDoc, getDocs, getDoc } from 'firebase/firestore'; 
import CreateCourse from './CreateCourse';

const Dashboard = ({ user }) => {
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    if (user.role === 'Instructor') {
      const q = query(collection(db, "courses"), where("instructorId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => setInstructorCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      return () => unsubscribe();
    }

    if (user.role === 'Student') {
      const allCoursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const unsubscribeAll = onSnapshot(allCoursesQuery, (querySnapshot) => setAllCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
      const enrollmentsQuery = query(collection(db, "enrollments"), where("studentId", "==", user.uid));
      const unsubscribeEnrolled = onSnapshot(enrollmentsQuery, async (enrollmentSnapshot) => {
        const coursePromises = enrollmentSnapshot.docs.map(enrollmentDoc => getDoc(doc(db, "courses", enrollmentDoc.data().courseId)));
        const courseDocs = await Promise.all(coursePromises);
        setEnrolledCourses(courseDocs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      
      return () => {
        unsubscribeAll();
        unsubscribeEnrolled();
      };
    }
  }, [user]);

  const handleLogout = () => signOut(auth);

  const handleEnroll = async (courseId) => {
    try {
      const enrollmentId = `${user.uid}_${courseId}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await setDoc(enrollmentRef, {
        studentId: user.uid,
        courseId: courseId,
        enrolledAt: new Date()
      });
      alert('Successfully enrolled!');
    } catch (error) {
      console.error("Error enrolling in course: ", error);
      alert('Failed to enroll. You might already be enrolled.');
    }
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
                  {instructorCourses.map(course => <li key={course.id}>{course.title}</li>)}
                </ul>
              ) : <p>You have not created any courses yet.</p>}
            </div>
          </div>
        )}

        {user.role === 'Student' && (
          <div>
            <h3>My Enrolled Courses</h3>
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map(course => (
                <div key={course.id} style={{ border: '1px solid #dfdfdf', backgroundColor: '#f9f9f9', padding: '1rem', marginTop: '1rem' }}>
                  <h4>{course.title}</h4>
                  <p><small>Instructor: {course.instructorEmail}</small></p>
                </div>
              ))
            ) : <p>You have not enrolled in any courses yet.</p>}

            <hr style={{margin: '2rem 0'}} />

            <h3>Available Courses</h3>
            {allCourses.length > 0 ? (
              allCourses.map(course => (
                <div key={course.id} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <p><small>Instructor: {course.instructorEmail}</small></p>
                  <button onClick={() => handleEnroll(course.id)}>Enroll</button>
                </div>
              ))
            ) : <p>No courses are available at this time.</p>}
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