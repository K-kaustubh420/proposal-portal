import React from 'react'
import Fadashboard from './Fadashboard'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
const page = () => {
  return (
    <>
    <nav>
     <Navbar />
    </nav>
     <ProtectedRoute>
    <div>
      < Fadashboard /> 
    </div></ProtectedRoute>
    </>
  )
}

export default page
