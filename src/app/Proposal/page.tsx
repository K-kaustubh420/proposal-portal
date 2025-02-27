"use client"
import React from 'react'
import EventProposalForm from './SubmitProposal'
import Navbar from '@/components/Navbar'
const page = () => {
  return (
    <>
    <nav> 
      <Navbar />
    </nav>
    <div>
      <EventProposalForm />
      </div> 
    </>
  )
}

export default page
