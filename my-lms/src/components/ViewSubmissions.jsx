import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const ViewSubmissions = ({ courseId, assignmentId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const submissionsRef = collection(db, "courses", courseId, "assignments", assignmentId, "submissions");
    const unsubscribe = onSnapshot(submissionsRef, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(subs);
    });
    return () => unsubscribe();
  }, [courseId, assignmentId]);

  const handleGradeChange = (submissionId, grade) => {
    setGrades(prev => ({ ...prev, [submissionId]: grade }));
  };

  const handleSaveGrade = async (submissionId) => {
    if (!grades[submissionId]) return;
    const submissionRef = doc(db, "courses", courseId, "assignments", assignmentId, "submissions", submissionId);
    await updateDoc(submissionRef, {
      grade: grades[submissionId]
    });
    alert('Grade saved!');
  };

  if (submissions.length === 0) {
    return <p>No submissions for this assignment yet.</p>;
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eef2f7' }}>
      <h4>Submissions</h4>
      {submissions.map(sub => (
        <div key={sub.id} style={{ borderTop: '1px solid #ccc', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
          <p><strong>From:</strong> {sub.studentEmail || sub.id}</p>
          <p><strong>Submission:</strong> {sub.content}</p>
          <p><strong>Grade:</strong> {sub.grade || 'Not Graded'}</p>
          <div>
            <input
              type="text"
              placeholder="Enter grade (e.g., A+)"
              onChange={(e) => handleGradeChange(sub.id, e.target.value)}
            />
            <button onClick={() => handleSaveGrade(sub.id)}>Save Grade</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewSubmissions;