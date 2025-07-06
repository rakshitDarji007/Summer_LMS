import React, { useState } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddModule = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddModule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !content) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const modulesCollectionRef = collection(db, 'courses', courseId, 'modules');

      await addDoc(modulesCollectionRef, {
        title: title,
        content: content,
        createdAt: serverTimestamp(),
      });

      setSuccess('Module added successfully!');
      setTitle('');
      setContent('');

    } catch (err) {
      setError('Failed to add module. ' + err.message);
    }
  };

  return (
    <div style={{ border: '1px solid #000', padding: '1rem', marginTop: '2rem', backgroundColor: '#f0f0f0' }}>
      <h4>Add New Module</h4>
      <form onSubmit={handleAddModule}>
        <div>
          <label>Module Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem' }}
          />
        </div>
        <div>
          <label>Module Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: '120px' }}
          />
        </div>
        <button type="submit">Add Module</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default AddModule;