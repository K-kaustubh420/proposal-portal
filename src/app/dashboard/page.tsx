'use client'
import React from 'react'
import Navbar from '@/components/Navbar'
import Dash from './Dash'
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
