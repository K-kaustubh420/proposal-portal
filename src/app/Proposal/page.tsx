"use client"
import React from 'react'
import EventProposalForm from './SubmitProposal'
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
      <EventProposalForm />
      </div></ProtectedRoute>
    </>
  )
}

export default page
