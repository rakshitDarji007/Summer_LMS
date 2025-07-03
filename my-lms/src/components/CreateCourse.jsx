import React, { useState } from 'react';
import { db, auth } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CreateCourse = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !description) {
            setError('Please file out all fields.');
            return;
        }

        try {
            await addDoc(collection(db, 'courses'), {
                title: title,
                description: description,
                instructorId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });

            setSuccess('Courses created!!');
            setTitle('');
            setDescription('');
        } catch (err) {
            setError('Failed to create course. ' + err.message);
        }
    };

    return (
        <div style = {{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem'}}>
            <h3>Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
                <div>
                    <label>Course Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem'}}
                    />
                </div>
                <div>
                    <label>Course Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', minHeight: '80px'}}
                    />
                </div>
                <button type="submit">Create Course</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green'}}>{success}</p>}
        </div>
    );
};

export default CreateCourse;