'use client'
import React from 'react'
import Navbar from '@/components/Navbar'
import Dash from './Dash'
import Deandash from '../deandashboard/Deandash'
const page = () => {
  return (
    <>
     <nav> 
      <Navbar /> 
      </nav>
      <div> 
        <Dash/>
      </div>
     
    </>
  )
}

export default page
