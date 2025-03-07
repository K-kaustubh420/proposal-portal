"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db, app } from '@/firebase/config';
import { collection, getDocs, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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
    detailedBudget?: { mainCategory: string; subCategory: string; totalAmount: number }[];
    actualBudget?: { label: string; amount: number }[];
}

interface BudgetItem {
    label: string;
    amount: number;
}

const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading bills...
    </div>
);

const Bill: React.FC = () => {
    const [userProposals, setUserProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null | undefined>(null);
    const [actualBudget, setActualBudget] = useState<BudgetItem[]>([]);
    const [newBudgetItem, setNewBudgetItem] = useState<BudgetItem>({ label: '', amount: 0 });

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
                    } as Proposal; // Cast to Proposal
                });

                // Corrected Date Filtering (Show PAST events)
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set today's time to midnight

                const validProposals = filteredProposalsList.filter(proposal => {
                    if (!proposal.endDate) return false;

                    const endDate = new Date(proposal.endDate);
                    //  NO setHours here. We compare against the FULL date-time.
                    return endDate < today  && proposal.status === 'Approved';; //  endDate is in the PAST
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
        let unsubscribe: () => void;

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
    }, [fetchUserProposals, currentUserEmail]);

    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
        setActualBudget(proposal.actualBudget || []);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
        setActualBudget([]);
        setNewBudgetItem({ label: '', amount: 0 });
    }, []);


    const addBudgetItem = () => {
        if (newBudgetItem.label.trim() && newBudgetItem.amount > 0) {
            setActualBudget([...actualBudget, newBudgetItem]);
            setNewBudgetItem({ label: '', amount: 0 });
        }
    };

    const removeBudgetItem = (index: number) => {
        const updatedBudget = actualBudget.filter((_, i) => i !== index);
        setActualBudget(updatedBudget);
    };

    const saveActualBudget = async () => {
        if (!selectedProposal) return;
        try {
            const proposalRef = doc(db, 'eventProposals', selectedProposal.id);
            await updateDoc(proposalRef, {
                actualBudget: actualBudget
            });
            if (currentUserEmail) {
                fetchUserProposals(currentUserEmail);
            }
            closePopup();
        } catch (error) {
            console.error("Error updating actual budget:", error);
        }
    };

    if (loading) {
        return <LoadingComponent />;
    }


    return (
        <div className="bg-gray-100 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-blue-700 mb-4">Billing Information</h1>
                <div className="overflow-x-auto">
                    <table className="table table-compact w-full">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Organizing department</th>
                                <th>Convener</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userProposals.length > 0 ? (
                                userProposals.map((proposal) => (
                                    <tr key={proposal.id} onClick={() => handleProposalClick(proposal)}>
                                        <td>{proposal.title}</td>
                                        <td>{proposal.organizer}</td>
                                        <td>{proposal.convenerName}</td>
                                        <td>{new Date(proposal.date).toLocaleDateString()}</td>
                                        <td>{new Date(proposal.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : proposal.status === 'Rejected' ? 'error' : proposal.status === 'Review' ? 'info' : ''}`}>{proposal.status}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center italic">No proposals with upcoming end dates.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedProposal && (
                <motion.div
                    className="fixed inset-0 z-50 shadow-md shadow-blue-200 flex items-center justify-center bg-gray-500 bg-opacity-50"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="bg-blue-50 rounded-lg border-t-4 border-blue-800 shadow-md shadow-blue-950 p-8 max-w-2xl w-full max-h-full overflow-y-auto"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                    >
                        <div className="flex justify-between rounded-md items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Budgeting Details - {selectedProposal.title}</h2>
                            <button onClick={closePopup} className="text-gray-600 hover:text-gray-800" aria-label='closepopup'>
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold mb-2">Proposed Budget</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Main Category</th>
                                        <th>Sub Category</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProposal.detailedBudget && selectedProposal.detailedBudget.length > 0 ? (
                                        selectedProposal.detailedBudget.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.mainCategory}</td>
                                                <td>{item.subCategory}</td>
                                                <td>${item.totalAmount?.toLocaleString() || 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center italic">No detailed budget provided.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <h3 className="text-lg font-semibold mt-6 mb-2">Actual Budget</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Label</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actualBudget.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.label}</td>
                                            <td>${item.amount.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => removeBudgetItem(index)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Label"
                                                className="input input-bordered input-sm w-full"
                                                value={newBudgetItem.label}
                                                onChange={(e) => setNewBudgetItem({ ...newBudgetItem, label: e.target.value })}
                                            />
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
                                        <td>
                                            <button
                                                className="btn btn-xs btn-primary"
                                                onClick={addBudgetItem}
                                            >
                                                Add
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={saveActualBudget}
                        >
                            Save Actual Budget
                        </button>
                    </motion.div>
                </motion.div>

            )}
        </div>
    );
};

export default Bill;