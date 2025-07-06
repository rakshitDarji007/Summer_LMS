import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import AddModule from '../components/AddModule';

const CourseDetail = ({ user }) => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();

  useEffect(() => {
    const courseDocRef = doc(db, 'courses', courseId);
    const getCourse = async () => {
      const docSnap = await getDoc(courseDocRef);
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    getCourse();

    const modulesQuery = query(collection(db, 'courses', courseId, 'modules'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(modulesQuery, (querySnapshot) => {
      const courseModules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(courseModules);
    });

    return () => unsubscribe();
  }, [courseId]);

  if (loading) {
    return <div>Loading course...</div>;
  }
  
  const isInstructor = user.uid === course?.instructorId;

  return (
    <div>
      <Link to="/">&larr; Back to Dashboard</Link>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
      <hr />
      
      {isInstructor && <AddModule courseId={courseId} />}

      <h3>Course Modules</h3>
      {modules.length > 0 ? (
        modules.map(module => (
          <div key={module.id} style={{border: '1px solid #eee', padding: '1rem', margin: '1rem 0'}}>
            <h4>{module.title}</h4>
            <p>{module.content}</p>
          </div>
        ))
      ) : (
        <p>This course has no modules yet.</p>
      )}
    </div>
  );
};

export default CourseDetail;