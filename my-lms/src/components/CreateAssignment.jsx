import React, { useState } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CreateAssignment = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !dueDate) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const assignmentsCollectionRef = collection(db, 'courses', courseId, 'assignments');
      await addDoc(assignmentsCollectionRef, {
        title,
        description,
        dueDate: new Date(dueDate),
        createdAt: serverTimestamp(),
        courseId,
      });

      setSuccess('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');

    } catch (err) {
      setError('Failed to create assignment. ' + err.message);
    }
  };

  return (
    <div style={{ border: '1px solid #000', padding: '1rem', marginTop: '2rem', backgroundColor: '#f0f0f0' }}>
      <h4>Create New Assignment</h4>
      <form onSubmit={handleCreateAssignment}>
        <div>
          <label>Assignment Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description / Prompt:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit">Create Assignment</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateAssignment;