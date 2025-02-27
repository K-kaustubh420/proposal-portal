"use client"
import { RxCross2 } from "react-icons/rx";
import { useState, useEffect } from 'react';
import { FaGoogle } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from '../firebase/config';

const Navbar = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push('/Proposal');
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleLoginPopup = () => {
    setIsLoginPopupOpen(!isLoginPopupOpen);
    setLoginError(null);
  };

  const signInWithGoogle = async () => {
    try {
      setLoginError(null);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsLoginPopupOpen(false);
    } catch (error) {
      console.error("Error signing in with Google", error);
      setLoginError(error.message);
    }
  };

  const signInWithEmailPassword = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginPopupOpen(false);
    } catch (error) {
      console.error("Error signing in with email and password", error);
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

   

  return (
  <>
      <div className="relative z-10 h-full flex flex-col">
        <nav className={`bg-blue-700 rounded-sm text-white flex items-center justify-between h-fit w-full px-3 py-2 border-b bg-opacity-70 ${isLoginPopupOpen ? 'blur-md' : ''} transition-filter duration-300 shadow-sm`}>
          <div className="flex items-center">
          
            <img src="/Srmlogo.jpg" alt="SRM Logo" className="w-12 h-12 rounded-full mr-4" />
            <h1 className="text-xl font-semibold">SRM Event Connect</h1>
           
          </div>
           {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-700  btn-ghost px-3 py-2 rounded-2xl hover:bg-red-800 text-white font-semibold  focus:outline-none focus:shadow-outline "
            >
              Logout
            </button>
          ) : (
            <button
              onClick={toggleLoginPopup}
              className="bg-blue-700  btn-ghost px-3 py-2 rounded-2xl hover:bg-blue-800 text-white font-semibold  focus:outline-none focus:shadow-outline "
            >
              Login
            </button>
          )}
        </nav>

        {isLoginPopupOpen && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-md relative m-4">
              <button
                onClick={toggleLoginPopup}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <RxCross2 size={24} />
              </button>

              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 w-20 h-20 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-xl"></div>

              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm">Please enter your details to sign in</p>
              </div>

              <div className="flex justify-center space-x-4 my-4">
                <button
                  onClick={signInWithGoogle}
                  className="p-3 bg-green-100 px-3 py-3 rounded-full"
                >
                  <FaGoogle size={20} />
                </button>
              </div>

              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-3 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={signInWithEmailPassword} className="space-y-4">
                {loginError && (
                  <div className="text-red-500 text-sm mb-2">{loginError}</div>
                )}
                <div>
                  <label className="block text-gray-900 text-sm font-medium">Your Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 mt-1 border bg-inherit rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Your Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-700 bg-inherit text-sm font-medium">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 mt-1 bg-inherit border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="********"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center text-sm bg-inherit text-gray-600">
                  <label className="flex items-center space-x-2 ">
                    <input type="checkbox" className="form-checkbox bg-white border-gray-300 rounded text-blue-600 focus:ring-blue-500" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Sign-in Button */}
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-2xl  text-lg font-medium shadow-md hover:opacity-80 transition px-3  ">
                  Sign in
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
   </>
  );
};

export default Navbar;