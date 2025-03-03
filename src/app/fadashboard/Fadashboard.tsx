"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Line, Pie } from 'react-chartjs-2';
import { motion } from "framer-motion";
import Link from 'next/link';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import {
    ListChecks,
    Clock,
    XCircle,
    CheckCircle,
    ArrowUpRight,
    Info,
    X,
    Plus
} from 'lucide-react';
import { db , auth, app } from '@/firebase/config'; // Import auth from firebase/config
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import necessary auth functions

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

// Chart options (reusing from EventPortal, can be adjusted if needed)
const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#ffffff',
            bodyColor: '#2D3748',
            titleColor: '#2D3748',
            borderColor: '#CBD5E0',
            borderWidth: 1,
            intersect: false,
            mode: 'index',
            bodyFont: { size: 14 },
            titleFont: { size: 16, weight: 'bold' },
            padding: 10,
            callbacks: {
                label: (context) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
        chartArea: { backgroundColor: '#f9fafb' },
    },
    scales: {
        y: {
            type: 'linear',
            beginAtZero: true,
            grid: {
                borderColor: '#CBD5E0',
                borderDash: [3, 3],
                color: '#CBD5E0',
                lineWidth: 1,
            },
            ticks: { color: '#4b5563', font: { size: 12 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#4b5563', font: { size: 12 } }
        }
    },
    elements: { line: { tension: 0.4 } }
};

const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Monthly Submissions',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Initialized to zeros
        borderColor: '#3b82f6',
        borderWidth: 3,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 1,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        segment: { borderColor: '#3b82f6', borderWidth: 3 },
    }],
};


const pieDataOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { color: '#4b5563' } },
        tooltip: {
            backgroundColor: '#ffffff',
            bodyColor: '#2D3748',
            titleColor: '#2D3748',
            borderColor: '#CBD5E0',
            borderWidth: 1,
            callbacks: {
                label: (context :any ) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
    },
    chartArea: { backgroundColor: '#f9fafb' }
};

// Proposal interface (reusing from EventPortal)
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
}

// Dynamic imports for chart components (reusing from EventPortal)
const LineChart = dynamic(() => Promise.resolve(Line), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

const PieChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

// Loading and No Proposals Components (reusing from EventPortal)
const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading proposals...
    </div>
);

// ** NoProposalsComponent is no longer directly used in conditional rendering **
// const NoProposalsComponent = () => (
//     <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
//         No proposals available for you.
//     </div>
// );

// Yearly dropdown component (reusing from EventPortal)
function YearlyDropdown() {
    const [selectedYearly, setSelectedYearly] = useState("Yearly");

    const handleChange = (event: any) => {
        setSelectedYearly(event.target.value);
    };

    return (
        <select
        className="select select-bordered select-sm bg-white text-gray-700"
        value={selectedYearly}
        onChange={handleChange}
    >
        <option value="Yearly">Yearly</option>
        <option value="Monthly">Monthly</option>
        <option value="Weekly">Weekly</option>
        <option value="Quaterly">Quaterly</option>
        <option value="Semesterly">Semesterly</option>
        <option value="Academic Yearly">Academic Yearly</option>

    </select>
    );
}

// Dashboard content component - Modified for MyDashboard
const MyDashboardContent: React.FC<{
    userProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
    currentUserEmail: string | null | undefined; // Add currentUserEmail as prop
}> = ({
    userProposals,
    loading,
    selectedProposal,
    handleProposalClick,
    closePopup,
    currentUserEmail, // Destructure currentUserEmail
}) => {

    // Calculate proposal counts for the user
    const approvedProposalsCount = userProposals.filter(p => p.status === 'Approved').length;
    const pendingProposalsCount = userProposals.filter(p => p.status === 'Pending').length;
    const rejectedProposalsCount = userProposals.filter(p => p.status === 'Rejected').length;
    const reviewProposalsCount = userProposals.filter(p => p.status === 'Review').length;
    const totalProposalsCount = userProposals.length;

    // Prepare data for pie chart - User specific data
    const pieData = {
        labels: ['Approved', 'Pending', 'Rejected', 'Review'],
        datasets: [{
            label: 'Proposal Status',
            data: [approvedProposalsCount, pendingProposalsCount, rejectedProposalsCount, reviewProposalsCount],
            backgroundColor: ['#A78BFA', '#F9A8D4', '#EF4444', '#3AB7BF'],
            borderWidth: 0,
            hoverOffset: 5
        }],
    };

    // Get recent proposals - User specific
    const recentAppliedProposals = userProposals.filter(p => p.status === 'Pending').slice().reverse();
    const recentApprovedProposals = userProposals.filter(p => p.status === 'Approved').slice().reverse();

    // Render loading or no proposals component
    if (loading) {
        return <LoadingComponent />;
    }

    // ** REMOVED CONDITIONAL RENDERING FOR "NO PROPOSALS AVAILABLE" HERE **
    // if (userProposals.length === 0) {
    //     return <NoProposalsComponent />;
    // }

    return (
        <>
            <div
                className=""
                style={{
                    backgroundImage: "url('/SRMIST-BANNER.jpg')",
                    backgroundSize: "cover",
                    backgroundAttachment: "fixed",
                    backgroundPosition: "center",
                }}
            >
                <div className={`bg-gray-100 bg-opacity-90 min-h-screen font-sans text-gray-900 ${selectedProposal ? 'blur-sm' : ''}`}>
                    <div className="p-6 max-w-7xl mx-auto space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-blue-700">My Dashboard</h1>
                                <p className="text-gray-500 text-sm">Snapshot of your event proposals for {currentUserEmail}</p> {/* Display user email */}
                            </div>
                            <div>
                                <YearlyDropdown />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card stat shadow-md rounded-lg border-t-4 border-blue-500 bg-white">
                                <div className="stat-figure text-blue-500"><ListChecks className="h-6 w-6" /></div>
                                <div className="stat-value">{totalProposalsCount.toLocaleString()}</div>
                                <div className="stat-title">Total Applied</div>
                            </div>

                            <div className="card stat shadow-md rounded-lg border-t-4 border-green-500 bg-white">
                                <div className="stat-figure text-green-500"><CheckCircle className="h-6 w-6" /></div>
                                <div className="stat-value">{approvedProposalsCount.toLocaleString()}</div>
                                <div className="stat-title">Approved</div>
                            </div>

                            <div className="card stat shadow-md rounded-lg border-t-4 border-red-500 bg-white">
                                <div className="stat-figure text-red-500"><XCircle className="h-6 w-6" /></div>
                                <div className="stat-value">{rejectedProposalsCount.toLocaleString()}</div>
                                <div className="stat-title">Rejected</div>
                            </div>

                            <div className="card stat shadow-md rounded-lg border-t-4 border-yellow-500 bg-white">
                                <div className="stat-figure text-yellow-500"><Clock className="h-6 w-6" /></div>
                                <div className="stat-value">{pendingProposalsCount.toLocaleString()}</div>
                                <div className="stat-title">Pending</div>
                            </div>
                            <div className="card stat shadow-md rounded-lg border-t-4 border-info bg-white">
                                <div className="stat-figure text-info"><Clock className="h-6 w-6" /></div>
                                <div className="stat-value">{reviewProposalsCount.toLocaleString()}</div>
                                <div className="stat-title">Review</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="card shadow-md rounded-lg p-5 md:p-7 bg-white">
                                    <div className="flex justify-between mb-4">
                                        <div>
                                            <h5 className="text-3xl font-bold text-gray-700 pb-2">{totalProposalsCount.toLocaleString()}</h5>
                                            <p className="text-base font-normal text-gray-700">Your Proposals this year</p>
                                        </div>
                                        <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-800 bg-green-100 rounded-full">
                                            +{(totalProposalsCount > 0 ? (approvedProposalsCount / totalProposalsCount * 100).toFixed(1) : 0)}%
                                            <ArrowUpRight className="w-3 h-3 ms-1" aria-hidden="true" color="currentColor" />
                                        </div>
                                    </div>
                                    <div className="h-72 relative">
                                        <LineChart data={lineData} options={lineOptions} />
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-5 mt-6">
                                        <button className="text-sm font-medium text-gray-500 text-center inline-flex items-center" type="button">
                                            Last Year
                                        </button>
                                        <a href="#" className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-500 hover:text-blue-700 bg-gray-50 hover:bg-gray-100 px-3 py-2">
                                            Submission Report
                                            <ArrowUpRight className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" color="currentColor" />
                                        </a>
                                    </div>
                                </div>

                                {/* Proposal Overview Table - User specific proposals */}
                                <div className="card shadow-md rounded-lg bg-white">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg font-bold text-gray-700 mb-4">Proposal Overview</h2>
                                        <div className="overflow-x-auto">
                                            <table className="table table-compact w-full">
                                                <thead>
                                                    <tr>
                                                        <th>Title</th>
                                                        <th>Organizing department</th>
                                                        <th>Convener</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userProposals.length > 0 ? (
                                                        userProposals.map((proposal) => (
                                                            <tr key={proposal.id} onClick={() => handleProposalClick(proposal)}>
                                                                <td >{proposal.title}</td>
                                                                <td >{proposal.organizer}</td>
                                                                <td >{proposal.convenerName}</td>
                                                                <td >{new Date(proposal.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
                                                                <td >
                                                                    <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : proposal.status === 'Rejected' ? 'error' : proposal.status === 'Review' ? 'info' : ''}`}>{proposal.status}</div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-center italic">No proposals submitted yet. <Link href="/Proposal" className="text-blue-500 hover:underline">Create a proposal now?</Link></td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-8">
                                <div className="card shadow-md rounded-lg p-4 md:p-6 bg-white">
                                    <div className="flex justify-between mb-3">
                                        <div className="flex justify-center items-center">
                                            <h5 className="text-xl font-bold leading-none text-gray-700 pe-1">Proposal Status</h5>
                                           {/* <button type="button" data-tooltip-target="data-tooltip-pie" data-tooltip-placement="bottom" className="hidden sm:inline-flex items-center justify-center text-gray-500 w-8 h-8 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 rounded-lg text-sm">
                                                <Info className="w-3.5 h-3.5" aria-hidden="true" color="currentColor" />
                                                <span className="sr-only">Tooltip</span>
                                            </button> */}
                                            <div id="data-tooltip-pie" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 tooltip dark:bg-slate-200">
                                                Status of your event proposals
                                                <div className="tooltip-arrow bg-white" data-popper-arrow></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64 relative text-slate-800">
                                        <PieChart data={pieData} options={pieDataOptions} />
                                    </div>
                                </div>

                                {/* Recently Applied Proposals List - User specific */}
                                <div className="card shadow-md rounded-lg bg-white">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="card-title text-lg font-bold text-gray-700">Recently Applied Proposals</h2>

                                        </div>
                                        <div className="space-y-3">
                                            {recentAppliedProposals.length > 0 ? (
                                                recentAppliedProposals.map(proposal => (
                                                    <div key={proposal.id} className="flex items-center justify-between" onClick={() => handleProposalClick(proposal)} >
                                                        <div className="flex items-center">
                                                            <div className="avatar mr-3">
                                                                <div className="mask mask-squircle w-8 h-8">
                                                                    {proposal.id % 3 === 0 ? (
                                                                        <img
                                                                            src={`/avatar${(proposal.id % 3) + 1}.png`}
                                                                            onError={(e) => e.target.style.display = "none"}
                                                                            alt={proposal.title || "Avatar"}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center rounded-full">
                                                                            <span className="text-xs font-bold">{proposal.convenerEmail?.substring(0, 2).toUpperCase() || "NA"}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-600">{proposal.organizer}</div>
                                                                <div className="text-sm text-gray-500">{proposal.title}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : 'error'}`}>{proposal.status}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center italic text-gray-500">No recent proposals.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recently Approved Proposals List - User specific
                                <div className="card shadow-md rounded-lg bg-white">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="card-title text-lg font-bold text-gray-700">Recently Approved Proposals</h2>

                                        </div>
                                        <div className="space-y-3">
                                            {recentApprovedProposals.map(proposal => (
                                                <div key={proposal.id} className="flex items-center justify-between" onClick={() => handleProposalClick(proposal)} style={{ cursor: 'pointer' }}>
                                                    <div className="flex items-center">
                                                        <div className="avatar mr-3">
                                                        <div className="mask mask-squircle w-8 h-8">
  {proposal.id % 3 === 0 ? (
    <img
      src={`/avatar${(proposal.id % 3) + 1}.png`}
      onError={(e) => e.target.style.display = "none"}
      alt={proposal.title || "Avatar"}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center rounded-full">
      <span className="text-xs font-bold">{proposal.convenerEmail?.substring(0, 2).toUpperCase() || "NA"}</span>
    </div>
  )}
</div>

                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-600">{proposal.organizer}</div>
                                                            <div className="text-sm text-gray-500">{proposal.title}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`badge badge-sm badge-success`}>Approved</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-4 right-4 flex justify-end">
                        <Link href="/Proposal" className="btn btn-primary btn-lg rounded-full shadow-md hover:shadow-lg text-white font-bold flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Create Proposal</span>
                        </Link>
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
     className="bg-blue-50 rounded-lg border-t-4 border-blue-800 shadow-md shadow-blue-950 p-8 max-w-md w-full"
     initial={{ y: 50, opacity: 0 }}
     animate={{ y: 0, opacity: 1 }}
     exit={{ y: 50, opacity: 0 }}
     transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
 >
                            <div className="flex justify-between rounded-md items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Proposal Details</h2>
                                <button onClick={closePopup} className="text-gray-600 hover:text-gray-800">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-700 font-semibold">Title:</p>
                                    <p className="text-gray-600">{selectedProposal.title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Organizer:</p>
                                    <p className="text-gray-600">{selectedProposal.organizer}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Date:</p>
                                    <p className="text-gray-600">{selectedProposal.date}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Category:</p>
                                    <p className="text-gray-600">{selectedProposal.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Description:</p>
                                    <p className="text-gray-600">{selectedProposal.description}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Cost:</p>
                                    <p className="text-gray-600">${selectedProposal.cost}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Email:</p>
                                    <p className="text-gray-600">{selectedProposal.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-semibold">Status:</p>
                                    <p className="text-gray-600">{selectedProposal.status}</p>
                                </div>
                            </div>

                            {/* Status update buttons removed for user dashboard */}

                     </motion.div>
            </motion.div>
                )}
            </div>
        </>
    );
};


// Main MyDashboard component
export default function MyDashboard() {
    const [userProposals, setUserProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null | undefined>(null); // State for user email

    useEffect(() => {
        const authInstance = getAuth(app); // Get auth instance
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            if (user) {
                setCurrentUserEmail(user.email); // Set current user email
            } else {
                setCurrentUserEmail(null);

            }
        });

        return () => unsubscribe(); // Unsubscribe on unmount
    }, []);


    // Fetch proposals from Firebase and filter by user email
    const fetchUserProposals = useCallback(async (userEmail) => { // Accept userEmail as argument
        setLoading(true);
        console.log("fetchUserProposals: Starting data fetch for user:", userEmail); // ADDED LOG
        try {
            const proposalsCollection = collection(db, 'eventProposals');
            console.log("fetchUserProposals: Collection reference created."); // ADDED LOG
            // Create a query to filter proposals by convenerEmail and now use userEmail
            const q = query(proposalsCollection, where("convenerEmail", "==", userEmail));
            console.log("fetchUserProposals: Query created:", q); // ADDED LOG
            const proposalSnapshot = await getDocs(q);
            console.log("fetchUserProposals: Snapshot received:", proposalSnapshot); // ADDED LOG
            console.log("fetchUserProposals: Snapshot is empty?", proposalSnapshot.empty); // ADDED LOG
            const filteredProposalsList = proposalSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.eventTitle,
                    organizer: data.organizingDepartment,
                    date: data.eventDate,
                    status: data.proposalStatus || 'Pending',
                    category: data.category,
                    cost: data.estimatedBudget,
                    email: data.convenerEmail,
                    description: data.eventDescription,
                    location: data.eventLocation,
                    convenerName: data.convenerName,
                    convenerEmail: data.convenerEmail,
                    ...data,
                };
            }) as Proposal[]; // Type assertion to Proposal[]

            console.log("fetchUserProposals: Filtered Proposals List:", filteredProposalsList); // ADDED LOG
            setUserProposals(filteredProposalsList);
            setLoading(false);
            console.log("fetchUserProposals: Data fetch complete, user proposals set."); // ADDED LOG
        } catch (error) {
            console.error("fetchUserProposals: Error fetching proposals:", error);
            setLoading(false);
            console.log("fetchUserProposals: Data fetch failed."); // ADDED LOG
        }
    }, []); // Removed currentUserEmail from dependency array

    useEffect(() => {
        if (currentUserEmail) { // Fetch proposals only when currentUserEmail is available
            fetchUserProposals(currentUserEmail); // Pass currentUserEmail to fetchUserProposals
        } else {
            setUserProposals([]); // Clear proposals if no user email
            setLoading(false); // Stop loading
            console.log("useEffect: No currentUserEmail, proposals cleared."); // ADDED LOG
        }
    }, [fetchUserProposals, currentUserEmail]); // Add currentUserEmail as dependency

    // Handlers for proposal actions (reusing from EventPortal)
    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
    }, []);


    return (
        <MyDashboardContent
            userProposals={userProposals}
            loading={loading}
            selectedProposal={selectedProposal}
            handleProposalClick={handleProposalClick}
            closePopup={closePopup}
            currentUserEmail={currentUserEmail} // Pass currentUserEmail to content component
        />
    );
}