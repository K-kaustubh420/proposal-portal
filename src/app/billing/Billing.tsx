"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db, app } from '@/firebase/config';
import { collection, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { X, Loader2, ArrowUp, ArrowDown } from 'lucide-react'; // Added ArrowUp and ArrowDown

interface Proposal {
  id: string;
  title: string;
  organizer: string;
  date: string;
  endDate: string;
  status: string;
  category: string;
  cost: number;
  email: string;
  description: string;
  location?: string;
  convenerName: string;
  convenerEmail: string;
  transport?: number;
  accommodation?: number;
  hall?: number;
  detailedBudget?: { mainCategory: string; subCategory: string; totalAmount: number; type?: string }[];
  actualBudget?: { label: string; amount: number; type?: string }[];
}

interface BudgetItem {
  label: string;
  amount: number;
  type?: string;
}

const LoadingComponent = () => (
  <div className="bg-base-200 min-h-screen font-sans text-base-content flex justify-center items-center">
    <Loader2 className="animate-spin h-8 w-8" />
    <span className="ml-2">Loading bills...</span>
  </div>
);

const Bill: React.FC = () => {
  const [userProposals, setUserProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null | undefined>(null);
  const [actualBudget, setActualBudget] = useState<BudgetItem[]>([]);
  const [newBudgetItem, setNewBudgetItem] = useState<BudgetItem>({ label: '', amount: 0, type: 'Domestic' });

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        setCurrentUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProposals = useCallback(async (userEmail: string) => {
    setLoading(true);
    try {
      const proposalsCollection = collection(db, 'eventProposals');
      const q = query(proposalsCollection, where("convenerEmail", "==", userEmail));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const filteredProposalsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            title: data.eventTitle,
            organizer: data.organizingDepartment,
            date: data.eventDate,
            endDate: data.eventEndDate,
            status: data.proposalStatus || 'Pending',
            category: data.category,
            cost: data.estimatedBudget,
            email: data.convenerEmail,
            description: data.eventDescription,
            location: data.eventLocation,
            convenerName: data.convenerName,
            convenerEmail: data.convenerEmail,
            detailedBudget: data.detailedBudget || [],
            actualBudget: data.actualBudget || [],
          } as Proposal;
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validProposals = filteredProposalsList.filter(proposal => {
          if (!proposal.endDate) return false;

          const endDate = new Date(proposal.endDate);
          return endDate < today && proposal.status === 'Approved';
        });

        setUserProposals(validProposals);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (currentUserEmail) {
      unsubscribe = fetchUserProposals(currentUserEmail) as unknown as () => void;
    } else {
      setUserProposals([]);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUserEmail, fetchUserProposals]);

  const handleProposalClick = useCallback((proposal: Proposal) => {
    setSelectedProposal(proposal);
    setActualBudget(proposal.actualBudget || []);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedProposal(null);
    setActualBudget([]);
    setNewBudgetItem({ label: '', amount: 0, type: 'Domestic' });
  }, []);

  const addBudgetItem = useCallback(() => {
    if (newBudgetItem.label.trim() && newBudgetItem.amount > 0) {
      setActualBudget(prevBudget => [...prevBudget, newBudgetItem]);
      setNewBudgetItem({ label: '', amount: 0, type: 'Domestic' });
    }
  }, [newBudgetItem, setActualBudget]);

  const removeBudgetItem = useCallback((index: number) => {
    const updatedBudget = actualBudget.filter((_, i) => i !== index);
    setActualBudget(updatedBudget);
  }, [actualBudget]);

  const saveActualBudget = useCallback(async () => {
    if (!selectedProposal) return;
    try {
      const proposalRef = doc(db, 'eventProposals', selectedProposal.id);
      await updateDoc(proposalRef, {
        actualBudget: actualBudget
      });
      closePopup();
      alert("Budget updated successfully!");

      //Refetch the Proposal List
      if (currentUserEmail) {
        fetchUserProposals(currentUserEmail);
      }

    } catch (error) {
      console.error("Error updating actual budget:", error);
      alert("Error updating budget. Please try again.");
    }
  }, [selectedProposal, actualBudget, closePopup, currentUserEmail, fetchUserProposals]);

  if (loading) {
    return <LoadingComponent />;
  }

  const budgetCategories: { [key: string]: string[] } = {
    "Budgetary Expenditures": [
      "Number of Sessions Planned",
      "Number of Keynote Speakers",
      "Number of Session Judges",
      "Number of Celebrities / Chief Guests",
    ],
    "Publicity": ["Invitation", "Press Coverage"],
    "General": [
      "Conference Kits",
      "Printing and Stationery",
      "Secretarial Expenses",
      "Mementos",
    ],
    "Honorarium": ["Keynote Speakers", "Session Judges", "Chief Guests"],
    "Hospitality": [
      "Train / Flight for Chief Guest / Keynote Speakers",
      "Accommodation for Chief Guest / Keynote Speakers",
      "Food and Beverages for Chief Guest / Keynote Speakers",
      "Local Travel Expenses",
      "Food for Participants",
      "Food & Snacks for Volunteers / Organizers",
      "Hostel Accommodation",
    ],
    "Inaugural and Valedictory": [
      "Banners, Pandal etc",
      "Lighting and Decoration",
      "Flower Bouquet",
      "Cultural Events",
      "Field Visits / Sightseeing",
      "Miscellaneous",
    ],
    "Resource Materials": ["Preparation, Printing, Binding"],
    "Conference Paper Publication": ["Extended Abstract", "Full Paper"],
    "Miscellaneous": [],
  };


  const getSubcategories = (mainCategory: string) => {
    return budgetCategories[mainCategory] || [];
  };

    // Calculate total estimated and actual amounts
    const totalEstimatedAmount = selectedProposal?.detailedBudget?.reduce((acc, item) => acc + item.totalAmount, 0) || 0;
    const totalActualAmount = actualBudget.reduce((acc, item) => acc + item.amount, 0);

    // Function to compare and display arrows
    const compareBudget = (actual: number, estimated: number) => {
      if (actual > estimated) {
        return <ArrowUp className="text-red-500 h-5 w-5" />;
      } else if (actual < estimated) {
        return <ArrowDown className="text-green-500 h-5 w-5" />;
      }
      return null; // No arrow if equal
    };

  return (
    <div className="bg-slate-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Billing Information</h1>
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="table table-compact w-full">
            <thead className="bg-blue-200">
              <tr className='text-gray-700'>
                <th className="text-lg">Title</th>
                <th className="text-lg">Organizing Dept.</th>
                <th className="text-lg">Convener</th>
                <th className="text-lg">Start Date</th>
                <th className="text-lg">End Date</th>
                <th className="text-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {userProposals.length > 0 ? (
                userProposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    onClick={() => handleProposalClick(proposal)}
                    className="hover:bg-blue-100 cursor-pointer transition-colors duration-200"
                  >
                    <td>{proposal.title}</td>
                    <td>{proposal.organizer}</td>
                    <td>{proposal.convenerName}</td>
                    <td>{new Date(proposal.date).toLocaleDateString()}</td>
                    <td>{new Date(proposal.endDate).toLocaleDateString()}</td>
                    <td>
                      <div className={`badge badge-sm ${proposal.status === 'Approved' ? 'badge-success' : proposal.status === 'Pending' ? 'badge-warning' : proposal.status === 'Rejected' ? 'badge-error' : 'badge-info'}`}>
                        {proposal.status}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center italic text-gray-500">No proposals with upcoming end dates.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProposal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-full overflow-y-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Budgeting Details - {selectedProposal.title}</h2>
              <button onClick={closePopup} className="text-gray-600 hover:text-blue-800 focus:outline-none" aria-label="Close">
                <X className="h-7 w-7" />
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-3">Proposed Budget</h3>
            <div className="overflow-x-auto rounded-md shadow-sm">
              <table className="table w-full">
                <thead className="bg-base-300">
                  <tr>
                    <th>Main Category</th>
                    <th>Subcategory</th>
                    <th>Type</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProposal.detailedBudget && selectedProposal.detailedBudget.length > 0 ? (
                    selectedProposal.detailedBudget.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-200"
                      >
                        <td>{item.mainCategory}</td>
                        <td>{item.subCategory}</td>
                        <td>{item.type}</td>
                        <td>${item.totalAmount?.toLocaleString() || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center italic text-gray-500"
                      >
                        No detailed budget provided.
                      </td>
                    </tr>
                  )}
                </tbody>
                 <tfoot>
                    <tr className="bg-gray-100">
                        <td colSpan={3} className="text-right font-bold">Total Estimated:</td>
                        <td>${totalEstimatedAmount.toLocaleString()}</td>
                    </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">Actual Budget</h3>
            <div className="overflow-x-auto rounded-md shadow-sm">
              <table className="table w-full">
                <thead className="bg-base-300">
                  <tr>
                    <th>Main Category</th>
                    <th>Subcategory</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {actualBudget.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-200"
                    >
                      <td>{item.label.split(' - ')[0]}</td>
                      <td>{item.label.split(' - ')[1] || 'N/A'}</td>
                      <td>{item.type}</td>
                      <td>${item.amount.toLocaleString()}</td>
                      <td className="text-right">
                        <button
                          className="btn btn-xs btn-error btn-square"
                          onClick={() => removeBudgetItem(index)}
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <select
                        className="select select-bordered w-full"
                        value={newBudgetItem.label.split(' - ')[0]}
                        onChange={(e) => {
                          const mainCategory = e.target.value;
                          const subCategory = getSubcategories(mainCategory)[0] || '';
                          setNewBudgetItem({
                            ...newBudgetItem,
                            label: `${mainCategory} - ${subCategory}`,
                          });
                        }}
                      >
                        <option
                          value=""
                          disabled
                          hidden
                        >
                          Select Main Category
                        </option>
                        {Object.keys(budgetCategories).map((mainCategory) => (
                          <option
                            key={mainCategory}
                            value={mainCategory}
                          >
                            {mainCategory}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select select-bordered w-full"
                        value={newBudgetItem.label.split(' - ')[1] || ''}
                        onChange={(e) => {
                          const mainCategory = newBudgetItem.label.split(' - ')[0];
                          const subCategory = e.target.value;
                          setNewBudgetItem({
                            ...newBudgetItem,
                            label: `${mainCategory} - ${subCategory}`,
                          });
                        }}
                      >
                        <option
                          value=""
                          disabled
                          hidden
                        >
                          Select Subcategory
                        </option>
                        {getSubcategories(newBudgetItem.label.split(' - ')[0]).map((subCategory) => (
                          <option
                            key={subCategory}
                            value={subCategory}
                          >
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="form-control">
                        <label className="cursor-pointer label">
                            <input
                                type="radio"
                                name="budgetType"
                                className="radio radio-primary"
                                value="Domestic"
                                checked={newBudgetItem.type === 'Domestic'}
                                onChange={() => setNewBudgetItem({ ...newBudgetItem, type: 'Domestic' })}
                            />
                            <span className="label-text ml-2">Domestic</span>
                        </label>
                        <label className="cursor-pointer label">
                            <input
                                type="radio"
                                name="budgetType"
                                className="radio radio-primary"
                                value="International"
                                checked={newBudgetItem.type === 'International'}
                                onChange={() => setNewBudgetItem({ ...newBudgetItem, type: 'International' })}
                            />
                            <span className="label-text ml-2">International</span>
                        </label>
                    </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered input-sm w-full"
                        value={newBudgetItem.amount === 0 ? '' : newBudgetItem.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9]*$/.test(value)) {
                            setNewBudgetItem({ ...newBudgetItem, amount: value === '' ? 0 : parseInt(value, 10) });
                          }
                        }}
                      />
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={addBudgetItem}
                        disabled={!newBudgetItem.label.trim() || newBudgetItem.amount <= 0}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="text-right font-bold">Total Actual:</td>
                    <td className='flex items-center gap-2'>
                      ${totalActualAmount.toLocaleString()}
                      {compareBudget(totalActualAmount, totalEstimatedAmount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={saveActualBudget}
              >
                Save Actual Budget
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Bill;