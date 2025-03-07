'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db, app } from '@/firebase/config';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Bill from './Bill';
import { format } from 'date-fns';


interface Proposal {
    id: string;
    title: string;
    organizer: string;
    date: string;
    status: string;
    category: string;
    cost: number;
    email: string;
    description: string;
    location?: string;
    convenerName: string;
    convenerEmail: string;
    chiefGuestName?: string;
    chiefGuestDesignation?: string;
    designation: string;
    detailedBudget: { locationType?: string; mainCategory: string; subCategory: string; totalAmount?: number }[];
    durationEvent: string;
    estimatedBudget: number;
    eventDate: string;
    eventDescription: string;
    eventEndDate: string;
    eventStartDate: string;
    eventTitle: string;
    fundingDetails?: {
        registrationFund?: number;
        sponsorshipFund?: number;
        universityFund?: number;
        otherSourcesFund?: number;
    };
    organizingDepartment: string;
    pastEvents?: string[];
    proposalStatus: string;
    relevantDetails?: string;
    sponsorshipDetails?: string[];
    sponsorshipDetailsRows?: { [key: string]: string | number | boolean }[];
    submissionTimestamp: string;
    rejectionMessage?: string;
    reviewMessage?: string;
}

const ApprovedProposalsDashboard = () => {
  const [approvedProposals, setApprovedProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);



    const hodEmailDepartmentMap = ({
        "hod.ctech.ktr.et@srmist.edu.in": "Ctech",
        "hod.cintel.ktr.et@srmist.edu.in": "Cintel"
    });

    const exceptionEmailDepartmentMap = ({
        "kkaustubh92@gmail.com": "Ctech",
        "kk6682@srmist.edu.in": "Cintel",
        "kn3959@srmist.edu.in": "Ctech",
        "neupanekiran512@gmail.com": "Aerospace Engineering",
        "neupanekiran450@gmail.com": "Automobile Engineering",
        "namasteportraits@gmailcom": "Biomedical Engineering",
        "rn8638@srmist.edu.in": "Biotechnology",
        "vm2486@srmist.edu.in": "Biotechnology"
    });

  const fetchApprovedProposals = useCallback(async (department: string | null = null) => {
    setLoading(true);
    try {
      if (!department) {
        throw new Error("Department not found");
      }

      const q = query(
        collection(db, 'eventProposals'),
        where("organizingDepartment", "==", department),
        where("proposalStatus", "==", "Approved")
      );

      const proposalSnapshot = await getDocs(q);
      const proposalsList = proposalSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: data.proposalStatus,
        } as Proposal;
      });
      setApprovedProposals(proposalsList);
    } catch (error) {
      console.error("Error fetching approved proposals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => {
        const authInstance = getAuth(app);
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            let department = null;
            if (user && user.email) {
                const email = user.email;
                if (hodEmailDepartmentMap.hasOwnProperty(email)) {
                  department = hodEmailDepartmentMap[email as keyof typeof hodEmailDepartmentMap];
                } else if (exceptionEmailDepartmentMap.hasOwnProperty(email)) {
                  department = exceptionEmailDepartmentMap[email as keyof typeof exceptionEmailDepartmentMap];
                }
                setUserDepartment(department);
              }
               else {
                setUserDepartment(null);
            }
        });
        return () => unsubscribe();
    }, [hodEmailDepartmentMap, exceptionEmailDepartmentMap]);


    useEffect(() => {
        if (userDepartment) {
            fetchApprovedProposals(userDepartment);
        } else {
            setLoading(false);
        }
    }, [fetchApprovedProposals, userDepartment]);

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseBill = () => {
    setSelectedProposal(null);
  };

  const handleSubmitBills = async (
    proposalId: string,
    bills: { [index: number]: { imageURL: string; actualAmount: string } }
  ) => {
    try {
      const billRef = doc(db, 'eventProposals', proposalId);

      const billDataToSave = Object.entries(bills).map(([index, bill]) => ({
        index: parseInt(index),
        imageURL: bill.imageURL,
        actualAmount: bill.actualAmount,
      }));

      await updateDoc(billRef, {
        actualBills: billDataToSave,
        billSubmissionStatus: 'submitted',
      });

      console.log('Bills submitted successfully for proposal:', proposalId);
      alert('Bills submitted successfully!');
      setSelectedProposal(null);
    } catch (error) {
      console.error('Error submitting bills:', error);
      alert('Failed to submit bills. Please try again.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        Approved Proposals
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-20">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 border-b">Title</th>
                  <th className="py-2 px-4 border-b">Organizer</th>
                  <th className="py-2 px-4 border-b">Convener</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedProposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={() => handleProposalClick(proposal)}
                  >
                    <td className="py-2 px-4 border-b">{proposal.title}</td>
                    <td className="py-2 px-4 border-b">{proposal.organizer}</td>
                    <td className="py-2 px-4 border-b">{proposal.convenerName}</td>
                   {/*<td className="py-2 px-4 border-b">
                      {format(new Date(proposal.date), 'PPP')} 
                    </td>*/}
                     <td className="py-2 px-4 border-b">
                                            <span className="text-green-500 font-semibold">Approved</span>
                                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedProposal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
                 <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Billing Details - {selectedProposal.title}
                </h2>
                 <button
                        onClick={handleCloseBill}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        Close
                      </button>
                      </div>
                <Bill selectedProposal={selectedProposal} />
                <div className="mt-4 flex justify-end">
                <button
                  onClick={() =>
                    handleSubmitBills(
                      selectedProposal.id,
                      selectedProposal.actualBills || {}
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit Bills
                </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovedProposalsDashboard;