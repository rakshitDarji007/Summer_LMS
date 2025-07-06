import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div>Loading course...</div>;
  }

  return (
    <div>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
      <hr />
      <h3>Course Content</h3>
      <p>Lectures and assignments will be listed here.</p>
    </div>
  );
};

export default CourseDetail;