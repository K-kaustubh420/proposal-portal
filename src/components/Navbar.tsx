"use client"
import { RxCross2 } from "react-icons/rx";
import { useState, useEffect } from 'react';
import { FaGoogle } from "react-icons/fa";
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from '@/firebase/config';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [loginError, setLoginError] = useState(null);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && pathname === '/') { // Conditionally redirect only if pathname is '/' (homepage)
        router.push('/fadashboard');
      }
    });
    return () => unsubscribe();
  }, [pathname, router]); // Add pathname to dependency array

  useEffect(() => {
    if (isClient && user) {
      // No need for router.push here anymore, handled in the onAuthStateChanged useEffect
    }
  }, [isClient, user, router]);

  const toggleLoginPopup = () => {
    setIsLoginPopupOpen(!isLoginPopupOpen);
    setLoginError(null);
  };

  const signInWithGoogle = async () => {
    try {
      setLoginError(null);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email?.endsWith('@srmist.edu.in')) {
        await signOut(auth);
        setIsLoginPopupOpen(true);
        setLoginError("Only SRMIST email addresses are allowed to sign in using Google.");
        return;
      }

      setIsLoginPopupOpen(false);
      router.push('/fadashboard'); // Redirect after successful Google login
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      setLoginError(error.message);
    }
  };

  const signInWithEmailPassword = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.endsWith('@srmist.edu.in')) {
      setLoginError("Only SRMIST email addresses are allowed.");
      return;
    }

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginPopupOpen(false);
      router.push('/fadashboard'); // Redirect after successful email/password login
    } catch (error: any) {
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
    <div className="navbar bg-[#52a1ff] text-white shadow-sm rounded-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl normal-case">
          <div className="flex items-center">
            <Image src="/Srmlogo.jpg" alt="SRM Logo" width={48} height={48} className="rounded-full mr-4" />
            <span>SRM Event Connect</span>
          </div>
        </Link>
      </div>
      <div className="flex-none">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {user.photoURL && (
                  <Image
                    alt="Profile"
                    src={user.photoURL}
                    width={50}
                    height={50}
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                  />
                )}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-slate-200 rounded-box w-52 text-black">

              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            onClick={toggleLoginPopup}
            className="bg-[#498edf] btn-ghost px-3 py-2 rounded-2xl hover:bg-blue-800 text-white font-semibold focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
        )}
      </div>

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
              <p className="text-gray-500 text-sm">Sign in with your SRMIST email</p>
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
                <label className="block text-gray-900 text-sm font-medium">SRMIST Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 mt-1 border bg-inherit rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Your SRMIST Email Address"
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

              {/* No Remember Me & Forgot Password for simplicity */}

              {/* Sign-in Button */}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-2xl  text-lg font-medium shadow-md hover:opacity-80 transition px-3  ">
                Sign in
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;