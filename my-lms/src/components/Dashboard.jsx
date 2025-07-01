import React from 'react';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

const Dashboard = ({ user }) => {
    const handleLogOut = () => {
        signOut(auth);

    };

    return (
        <div>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>LearnHUB Dashboard</h1>
                <button onClick={handleLogOut}>Logout</button>
            </nav>
            <main>
                <h2>Welcome, {user.email}!</h2>
                <p>Your Assigned role is: <strong>{user.role}</strong></p>
                <hr/>

                {user.role === 'Instructor' && (
                    <div>
                        <h3>Instructor Tools</h3>
                        <p>Here you will eventually create and manage your courses</p>
                    </div>
                )}


                {user.role === 'Student' && (
                    <div>
                        <h3>My Courses</h3>
                        <p>Here you will see the courses you are enrolled in!</p>
                    </div>
                )}

                {user.role === 'Admin' && (
                    <div>
                        <h3>Admin Panel</h3>
                        <p> Here you will manage the users and site settings</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;