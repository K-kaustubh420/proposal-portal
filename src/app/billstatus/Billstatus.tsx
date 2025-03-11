"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
    Star,
    Mail,
    Inbox,
    AlertCircle,
    XCircle,
    MoreVertical,
    ArrowUp, // Import ArrowUp icon
    ArrowDown, // Import ArrowDown icon
} from 'lucide-react'; // Import icons
import { motion } from 'framer-motion';
import { DocumentData } from 'firebase/firestore';


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
    read?: boolean; // Track read status
    starred?: boolean; // Track starred status
    reviewLater?: boolean; // Track "review later" status
}

const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading bills...
    </div>
);
const ViewBills: React.FC = () => {
    const [bills, setBills] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<Proposal | null>(null);


    const fetchBills = useCallback(() => {
        setLoading(true);
        try {
            const proposalsCollection = collection(db, 'eventProposals');
            // Fetch all "Approved" proposals (and "Done" if you still want them)
            const q = query(proposalsCollection, where("proposalStatus", "in", ["Approved", "Done"]));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                console.log("Documents fetched (Approved or Done status):", querySnapshot.docs.length);

                const billsData = querySnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    return {
                        ...data,
                        id: doc.id,
                        title: data.eventTitle,
                        organizer: data.organizingDepartment,
                        date: data.eventDate,
                        endDate: data.eventEndDate,
                        status: data.proposalStatus || "Pending",
                        category: data.category,
                        cost: data.estimatedBudget,
                        email: data.convenerEmail,
                        description: data.eventDescription,
                        location: data.eventLocation,
                        convenerName: data.convenerName,
                        convenerEmail: data.convenerEmail,
                        detailedBudget: data.detailedBudget || [],
                        actualBudget: data.actualBudget || [],
                        read: data.read || false,
                        starred: data.starred || false,
                        reviewLater: data.reviewLater || false,
                    } as Proposal;
                });

                // Filter bills:
                const validBills = billsData.filter(bill => {
                    if (bill.actualBudget === undefined || bill.actualBudget.length === 0) {
                        return false; // Exclude if no actualBudget
                    }

                    if (bill.status === "Approved") {
                        if (bill.endDate) {
                            const endDate = new Date(bill.endDate);
                            const currentDate = new Date();
                            currentDate.setHours(0, 0, 0, 0); // Set current date to start of day for comparison
                            endDate.setHours(0, 0, 0, 0);     // Set end date to start of day for comparison
                            return endDate < currentDate; // Only include if endDate is before today
                        } else {
                            return false; // If status is "Approved" but no endDate, exclude (or handle as needed)
                        }
                    } else if (bill.status === "Done") {
                        return true; // Include "Done" status bills regardless of end date (adjust if needed)
                    }

                    return false; // Exclude other statuses (or handle them as needed)
                });

                console.log("Valid bills after date and status filter:", validBills.length); // Log the filtered count
                setBills(validBills);
                setLoading(false);
            });
            return unsubscribe;

        } catch (error) {
            console.error("Error fetching bills:", error);
            setLoading(false);
            return () => { };
        }
    }, []);

    useEffect(() => {
        const unsubscribe = fetchBills();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [fetchBills]);


    const toggleRead = useCallback(async (id: string) => {
        const bill = bills.find(b => b.id === id);
        if (!bill) return;
        try {
            const billRef = doc(db, 'eventProposals', id);
            await updateDoc(billRef, {
                read: !bill.read
            });
            //  Refetch after updating.  More efficient than trying to update local state.
            fetchBills();
        } catch (error) {
            console.error("Error toggling read status:", error);
        }
    }, [bills, fetchBills]); //  Dependencies for useCallback

    const toggleStarred = useCallback(async (id: string) => {
        const bill = bills.find((b) => b.id === id);
        if (!bill) return;  //  Handle case where bill might not be found
        try {
            const billRef = doc(db, "eventProposals", id);
            await updateDoc(billRef, {
                starred: !bill.starred,
            });
            fetchBills();
        } catch (error) {
            console.error("Error toggling starred status:", error);
        }

    }, [bills, fetchBills]);

    const toggleReviewLater = useCallback(async (id: string) => {
        const bill = bills.find((b) => b.id === id);
        if (!bill) return; // Handle case where bill is not found
        try {
            const billRef = doc(db, "eventProposals", id);
            await updateDoc(billRef, {
                reviewLater: !bill.reviewLater,
            });
            fetchBills();
        } catch (error) {
            console.error("Error toggling review later status:", error);
        }
    }, [bills, fetchBills]);

    const handleBillClick = useCallback((bill: Proposal) => {
        setSelectedBill(bill);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedBill(null);
    }, []);

    // Helper function to calculate total proposed budget
    const calculateTotalProposedBudget = useCallback((detailedBudget: { mainCategory: string; subCategory: string; totalAmount: number }[] | undefined) => {
        if (!detailedBudget) return 0;
        return detailedBudget.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
    }, []);

    // Helper function to calculate total actual budget
    const calculateTotalActualBudget = useCallback((actualBudget: { label: string; amount: number }[] | undefined) => {
        if (!actualBudget) return 0;
        return actualBudget.reduce((acc, item) => acc + item.amount, 0);
    }, []);

    if (loading) {
        return <LoadingComponent />;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-blue-700 mb-4">View Bills</h1>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="border-b border-gray-200">
                        {/* Toolbar (Optional) -  Add filtering/sorting here if needed */}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {/* Checkbox for select all (optional) */}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Organizer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bills.map((bill) => (
                                    <tr
                                        key={bill.id}
                                        className={`hover:bg-gray-50 cursor-pointer ${bill.read ? "bg-gray-100" : "bg-white"
                                            } ${selectedBill?.id === bill.id ? "bg-blue-50" : ""}`}
                                        onClick={() => handleBillClick(bill)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {!bill.read && (
                                                    <div className="flex-shrink-0 h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                                )}
                                                {bill.starred ? (
                                                    <Star className="h-5 w-5 text-yellow-400" />
                                                ) : (
                                                    <Star className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.status === "Approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : bill.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {bill.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {bill.organizer}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {bill.endDate ? new Date(bill.endDate).toLocaleDateString() : "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRead(bill.id);
                                                    }}
                                                    title="Mark as Read/Unread"
                                                    aria-label="mark as read/unread"
                                                >
                                                    {bill.read ? (
                                                        <Inbox className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                                    ) : (
                                                        <Mail className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStarred(bill.id);
                                                    }}
                                                    title="Star/Unstar"
                                                    aria-label='Star/Unstar'
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${bill.starred
                                                            ? "text-yellow-400"
                                                            : "text-gray-400"
                                                            } hover:text-yellow-500`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleReviewLater(bill.id);
                                                    }}
                                                    title="Review Later"
                                                    aria-label='Review Later'
                                                >
                                                    <AlertCircle
                                                        className={`h-5 w-5 ${bill.reviewLater
                                                            ? "text-blue-500"
                                                            : "text-gray-400"
                                                            } hover:text-blue-600`}
                                                    />
                                                </button>

                                                {/* More Options (Dropdown - optional) */}
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        type="button"
                                                        className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        aria-label='button title'
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>

                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bills.length === 0 && (
                            <div className="text-center p-4">No bills found.</div>
                        )}
                    </div>
                </div>
            </div>
            {selectedBill && (
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
                            <h2 className="text-xl font-bold text-gray-800">Bill Details - {selectedBill.title}</h2>
                            <button onClick={closePopup} className="text-gray-600 hover:text-gray-800" aria-label='closepopup'>
                                <XCircle className="h-6 w-6" />
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
                                    {selectedBill.detailedBudget && selectedBill.detailedBudget.length > 0 ? (
                                        selectedBill.detailedBudget.map((item, index) => (
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
                                        <th>Comparison</th>{/* Added Comparison column */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBill.actualBudget && selectedBill.actualBudget.length > 0 ? (
                                        selectedBill.actualBudget.map((item, index) => {
                                            // Find corresponding proposed amount (if it exists)
                                            const proposedAmount = selectedBill.detailedBudget?.find(
                                                (proposedItem) => proposedItem.mainCategory === item.label // Match by label (adjust as needed)
                                            )?.totalAmount || 0;

                                            return (
                                                <tr key={index}>
                                                    <td>{item.label}</td>
                                                    <td>${item.amount.toLocaleString()}</td>
                                                    <td>
                                                        {item.amount > proposedAmount ? (
                                                            <ArrowUp className="text-red-500 h-5 w-5" />  // Up arrow for higher
                                                        ) : item.amount < proposedAmount ? (
                                                            <ArrowDown className="text-green-500 h-5 w-5" /> // Down arrow for lower
                                                        ) : (
                                                            "" // No arrow if equal (or handle as you prefer)
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center italic">  {/* Changed colSpan to 3 */}
                                                No actual budget details provided.
                                            </td>
                                        </tr>
                                    )}
                                    {/* Total Row (Optional) */}
                                    <tr>
                                        <td className="font-bold">Total:</td>
                                        <td className="font-bold">
                                            ${calculateTotalActualBudget(selectedBill.actualBudget).toLocaleString()}
                                        </td>
                                        <td>
                                            {(() => {
                                                const totalProposed = calculateTotalProposedBudget(selectedBill.detailedBudget);
                                                const totalActual = calculateTotalActualBudget(selectedBill.actualBudget);

                                                if (totalActual > totalProposed) {
                                                    return <ArrowUp className="text-red-500 h-5 w-5" />;
                                                } else if (totalActual < totalProposed) {
                                                    return <ArrowDown className="text-green-500 h-5 w-5" />;
                                                }
                                                return null; // Or some other indicator for equality
                                            })()}
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ViewBills;