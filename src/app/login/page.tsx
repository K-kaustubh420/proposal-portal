"use client";
import React, { useState } from "react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const LoginPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="bg-blue-800 text-white flex items-center p-3">
        <img src="/Srmlogo.jpg" alt="SRM Logo" className="w-12 h-12 rounded-full mr-4" />
        <h1 className="text-xl font-semibold">SRM Event Connect</h1>
      </nav>

      <div className="flex flex-grow flex-col md:flex-row">
 
        <div
          className="hidden md:flex md:w-2/3 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/tp.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start text-left p-16">
            <h1 className="text-4xl font-bold text-teal-400">Department of Computing Technologies</h1>
            <h2 className="text-3xl font-bold text-white">In-House Proposal Management</h2>
            <p className="text-lg text-gray-200 mt-4">
              A powerful tool for proposal management created by the Department of Computing Technologies (CTech).
              <br />
              This Event Connect platform simplifies and enhances the proposal management process, streamlining proposal creation, submission, and review.
            </p>
          </div>
        </div>

        {/* Right Section - Sign-in Form */}
        <div className="w-full md:w-1/3 flex justify-center items-center bg-gray-100">
          <div className="bg-white shadow-2xl rounded-2xl p-10 w-96 relative">
            {/* Light Bluish Effect */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-20 h-20 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-xl"></div>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
              <p className="text-gray-500 text-sm">Please enter your details to sign in</p>
            </div>

            {/* Social Login */}
            <div className="flex justify-center space-x-4 my-4">
              <button className="p-3 bg-gray-100 rounded-full">
                <FaGoogle size={20} />
              </button>
              <button className="p-3 bg-gray-100 rounded-full">
                <FaApple size={20} />
              </button>
              <button className="p-3 bg-gray-100 rounded-full">
                <RxCross2 size={20} />
              </button>
            </div>

            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium">Your Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Your Email Address"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="********"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox text-blue-600" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button className="w-full bg-black text-white py-2 rounded-md text-lg font-medium shadow-md hover:opacity-80 transition">
                Sign in
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <a href="#" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
