import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const SubmitAssignment = ({ courseId, assignmentId }) => {
  const [submission, setSubmission] = useState('');
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = auth.currentUser.uid;
  const submissionRef = doc(db, "courses", courseId, "assignments", assignmentId, "submissions", studentId);

  useEffect(() => {
    const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
      if (docSnap.exists()) {
        setExistingSubmission(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [submissionRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission) return;

    try {
      await setDoc(submissionRef, {
        content: submission,
        studentId: studentId,
        studentEmail: auth.currentUser.email,
        submittedAt: serverTimestamp(),
        grade: null,
      });
    } catch (error) {
      console.error("Error submitting assignment: ", error);
      alert("Failed to submit assignment.");
    }
  };

  if (loading) {
    return <p>Loading submission status...</p>;
  }

  if (existingSubmission) {
    return (
      <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#e9f5e9'}}>
        <h4>Your Submission:</h4>
        <p>{existingSubmission.content}</p>
        <p><strong>Grade: {existingSubmission.grade || 'Not Graded Yet'}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
      <textarea
        value={submission}
        onChange={(e) => setSubmission(e.target.value)}
        placeholder="Type your submission here..."
        style={{ width: '100%', minHeight: '100px' }}
      />
      <button type="submit">Submit Work</button>
    </form>
  );
};

export default SubmitAssignment;