
import React from 'react';
import Header from './Header';
import LoginForm from './LoginForm';
import ImageSection from './ImageSection';

const LoginPage = () => {
    return (
        <div className='flex h-screen'>
            <div className='flex-1 bg-cover bg-green-200 flex justify-center items-center'>
                <ImageSection />
            </div>
            <div className="flex-1 bg-white-500 min-h-full flex flex-col items-center justify-center">
                <Header />
                <LoginForm />
            </div>

        </div>
    );
};

export default LoginPage;