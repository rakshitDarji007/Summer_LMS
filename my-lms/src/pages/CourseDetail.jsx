// src/pages/CourseDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import AddModule from '../components/AddModule';
import CreateAssignment from '../components/CreateAssignment';
import SubmitAssignment from '../components/SubmitAssignment';

const CourseDetail = ({ user }) => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { courseId } = useParams();

  useEffect(() => {
    const courseDocRef = doc(db, 'courses', courseId);
    getDoc(courseDocRef).then(docSnap => {
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    const modulesQuery = query(collection(db, 'courses', courseId, 'modules'), orderBy('createdAt', 'asc'));
    const unsubscribeModules = onSnapshot(modulesQuery, (snapshot) => {
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const assignmentsQuery = query(collection(db, 'courses', courseId, 'assignments'), orderBy('createdAt', 'asc'));
    const unsubscribeAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (user.role === 'Student') {
      const enrollmentDocRef = doc(db, 'enrollments', `${user.uid}_${courseId}`);
      getDoc(enrollmentDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setIsEnrolled(true);
        }
      });
    }

    return () => {
      unsubscribeModules();
      unsubscribeAssignments();
    };
  }, [courseId, user.uid, user.role]);

  if (loading) return <div>Loading course...</div>;
  
  const isInstructor = user.uid === course?.instructorId;

  return (
    <div>
      <Link to="/">&larr; Back to Dashboard</Link>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
      <hr />

      <h3>Course Modules</h3>
      {modules.length > 0 ? (
        modules.map(module => (
          <div key={module.id} style={{border: '1px solid #eee', padding: '1rem', margin: '1rem 0'}}>
            <h4>{module.title}</h4>
            <p>{module.content}</p>
          </div>
        ))
      ) : <p>This course has no modules yet.</p>}
      
      {isInstructor && <AddModule courseId={courseId} />}

      <hr />
      
      <h3>Assignments</h3>
      {assignments.length > 0 ? (
        assignments.map(assignment => (
          <div key={assignment.id} style={{border: '1px solid #ddd', padding: '1rem', margin: '1rem 0'}}>
            <h4>{assignment.title}</h4>
            <p>{assignment.description}</p>
            <p><small>Due: {new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}</small></p>
            {user.role === 'Student' && isEnrolled && (
              <SubmitAssignment courseId={courseId} assignmentId={assignment.id} />
            )}
          </div>
        ))
      ) : <p>This course has no assignments yet.</p>}

      {isInstructor && <CreateAssignment courseId={courseId} />}
    </div>
  );
};

export default CourseDetail;