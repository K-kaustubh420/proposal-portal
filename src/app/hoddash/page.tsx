'use client'
import React from 'react'
import Navbar from '@/components/Navbar'
import Dash from './Dash'
import Deandash from '../deandashboard/Deandash'
import ProtectedRoute from "@/components/ProtectedRoute";
const page = () => {
  return (
    <>
     <nav> 
      <Navbar /> 
      </nav>
      <ProtectedRoute>
      <div> 
        <Dash/>
      </div></ProtectedRoute>
     
    </>
  )
}

export default page
