"use client";
import React, { useState } from "react";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="bg-blue-800 text-white flex items-center p-3">
        <img src="/Srmlogo.jpg" alt="SRM Logo" className="w-12 h-12 rounded-full mr-4" />
        <h1 className="text-xl font-semibold">SRM Event Connect</h1>
      </nav>

      <div className="relative md:hidden h-52 bg-cover bg-center " style={{ backgroundImage: "url('/tp.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-2xl font-bold text-teal-400">Department of Computing Technologies</h1>
          <h2 className="text-xl font-bold text-white">In-House Proposal Management</h2>
          <p className="text-sm text-gray-200 px-2">
            A powerful tool for proposal management created by the Department of Computing Technologies (CTech).
          </p>
        </div>
      </div>

      <div className="flex flex-grow flex-col md:flex-row">
        <div className="hidden md:flex md:w-2/3 bg-cover bg-center relative" style={{ backgroundImage: "url('/tp.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start text-left p-16">
            <h1 className="text-4xl font-bold text-teal-400">Department of Computing Technologies</h1>
            <h2 className="text-3xl font-bold text-white">In-House Proposal Management</h2>
            <p className="text-lg text-gray-200 mt-4">
              A powerful tool for proposal management created by the Department of Computing Technologies (CTech).
              <br />
              This Event Connect platform simplifies and enhances the proposal management process which streamlines proposal creation, submission, and review.
            </p>
            
          </div>
        </div>
        <div className="w-full md:w-1/3 bg-white flex flex-col justify-center p-12 shadow-xl">
          <div className="flex border-b border-gray-300">
            <button
              className={`w-1/2 py-2 text-lg font-semibold ${isLogin ? "border-b-4 border-blue-500" : "text-gray-500"}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-2 text-lg font-semibold ${!isLogin ? "border-b-4 border-blue-500" : "text-gray-500"}`}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          {isLogin ? (
            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input type="email" className="input input-bordered w-full px-4 py-3 rounded-md shadow-sm" placeholder="Enter your email" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input type="password" className="input input-bordered w-full px-4 py-3 rounded-md shadow-sm" placeholder="Enter your password" required />
              </div>
              <div className="text-right">
                <a href="#" className="text-blue-600 text-sm hover:underline">Forgot password?</a>
              </div>
              <button className="btn btn-primary w-full py-3 text-lg rounded-md">Login</button>
            </form>
          ) : (
            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input type="text" className="input input-bordered w-full px-4 py-3 rounded-md shadow-sm" placeholder="Enter your full name" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input type="email" className="input input-bordered w-full px-4 py-3 rounded-md shadow-sm" placeholder="Enter your email" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input type="password" className="input input-bordered w-full px-4 py-3 rounded-md shadow-sm" placeholder="Create a password" required />
              </div>
              <button className="btn btn-primary w-full py-3 text-lg rounded-md">Sign Up</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
