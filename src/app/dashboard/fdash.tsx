"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Line, Pie } from 'react-chartjs-2';
import { motion } from "framer-motion";
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
    X
} from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

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

// Chart options
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
        data: [60, 55, 40, 85, 64, 70, 94, 34, 78, 54, 76, 56],
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
                label: (context) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
    },
    chartArea: { backgroundColor: '#f9fafb' }
};

// Proposal interface
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

// Dynamic imports for chart components
const LineChart = dynamic(() => Promise.resolve(Line), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

const PieChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

// Loading and No Proposals Components
const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading proposals...
    </div>
);

const NoProposalsComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        No proposals available.
    </div>
);

// Yearly dropdown component
function YearlyDropdown() {
    const [selectedYearly, setSelectedYearly] = useState("Yearly");

    const handleChange = (event) => {
        setSelectedYearly(event.target.value);
    };

    return (
        <select
        className="select select-bordered select-sm bg-white text-gray-700"
        value={selectedYearly}
        onChange={handleChange}
    >
        <option value="Yearly">Yearly</option> {/* Added value attribute */}
        <option value="Monthly">Monthly</option> {/* Added value attribute */}
        <option value="Weekly">Weekly</option>   {/* Added value attribute */}
    </select>
    );
}

// Dashboard content component
const DashboardContent: React.FC<{
    eventProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    isUpdatingStatus: boolean;
    statusUpdateMessage: string | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
    updateProposalStatus: (proposal: Proposal, newStatus: string) => Promise<void>;
}> = ({
    eventProposals,
    loading,
    selectedProposal,
    isUpdatingStatus,
    statusUpdateMessage,
    handleProposalClick,
    closePopup,
    updateProposalStatus,
}) => {

    // Calculate proposal counts
    const approvedProposalsCount = eventProposals.filter(p => p.status === 'Approved').length;
    const pendingProposalsCount = eventProposals.filter(p => p.status === 'Pending').length;
    const rejectedProposalsCount = eventProposals.filter(p => p.status === 'Rejected').length;
    const reviewProposalsCount = eventProposals.filter(p => p.status === 'Review').length; // Add review count
    const totalProposalsCount = eventProposals.length;

    // Prepare data for pie chart
    const pieData = {
        labels: ['Approved', 'Pending', 'Rejected', 'Review'], // Added Review
        datasets: [{
            label: 'Proposal Status',
            data: [approvedProposalsCount, pendingProposalsCount, rejectedProposalsCount, reviewProposalsCount],
            backgroundColor: ['#A78BFA', '#F9A8D4', '#EF4444', '#3AB7BF'],
            borderWidth: 0,
            hoverOffset: 5
        }],
    };

    // Get recent proposals
    const recentApprovedProposals = eventProposals.filter(p => p.status === 'Approved').slice(-3).reverse();
    const recentAppliedProposals = eventProposals.filter(p => p.status === 'Pending').slice(-3).reverse();

    // Render loading or no proposals component
    if (loading) {
        return <LoadingComponent />;
    }

    if (eventProposals.length === 0) {
        return <NoProposalsComponent />;
    }

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
                                <h1 className="text-2xl font-bold text-blue-700">Welcome</h1>
                                <p className="text-gray-500 text-sm">Snapshot of event proposals</p>
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
                                            <p className="text-base font-normal text-gray-700">Proposals this year</p>
                                        </div>
                                        <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-800 bg-green-100 rounded-full">
                                            +{(approvedProposalsCount / totalProposalsCount * 100).toFixed(1)}%
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

                                {/* Proposal Overview Table */}
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
                                                    {eventProposals.map((proposal) => (
                                                        <tr key={proposal.id}>
                                                            <td>{proposal.title}</td>
                                                            <td>{proposal.organizer}</td>
                                                            <td>{proposal.convenerName}</td>
                                                            <td>{new Date(proposal.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
                                                            <td>
                                                                <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : proposal.status === 'Rejected' ? 'error' : proposal.status === 'Review' ? 'info' : ''}`}>{proposal.status}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
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
                                            <button type="button" data-tooltip-target="data-tooltip-pie" data-tooltip-placement="bottom" className="hidden sm:inline-flex items-center justify-center text-gray-500 w-8 h-8 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 rounded-lg text-sm">
                                                <Info className="w-3.5 h-3.5" aria-hidden="true" color="currentColor" />
                                                <span className="sr-only">Tooltip</span>
                                            </button>
                                            <div id="data-tooltip-pie" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 tooltip dark:bg-slate-200">
                                                Status of event proposals
                                                <div className="tooltip-arrow bg-white" data-popper-arrow></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64 relative text-slate-800">
                                        <PieChart data={pieData} options={pieDataOptions} />
                                    </div>
                                </div>

                            </div></div></div></div></div>
        </>
    );
};

// Main EventPortal component
export default function EventPortal() {
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

    // Fetch proposals from Firebase
    const fetchProposals = useCallback(async () => {
        setLoading(true);
        try {
            const proposalsCollection = collection(db, 'eventProposals');
            const proposalSnapshot = await getDocs(proposalsCollection);
            const proposalsList = proposalSnapshot.docs.map(doc => {
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
            });
            setEventProposals(proposalsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    // Handlers for proposal actions
    const closePopup = useCallback(() => {
        setSelectedProposal(null);
    }, []);

    // Update proposal status and send email via API
    const updateProposalStatus = useCallback(async (proposalToUpdate: Proposal, newStatus: string) => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        setStatusUpdateMessage('Updating status...');

        try {
            // Optimistically update local state
            setEventProposals(currentProposals =>
                currentProposals.map(proposal =>
                    proposal.id === proposalToUpdate.id ? { ...proposal, status: newStatus } : proposal
                )
            );
            setSelectedProposal(null); // Close the popup

            // Update Firestore
            const proposalDocRef = doc(db, 'eventProposals', proposalToUpdate.id);
            await updateDoc(proposalDocRef, { proposalStatus: newStatus });

            // Send email via API
            const updatedProposal = { ...proposalToUpdate, status: newStatus };
            console.log('Sending update request to /api/email...', updatedProposal);

            const response = await fetch('/api/sendmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposal: updatedProposal, action: 'update' }),
            });

            console.log('API response status:', response.status);
            const data = await response.json();
            console.log('API response data:', data);

            if (data.error) {
                throw new Error(data.error); // Correctly throw the error
            }

            setStatusUpdateMessage(`Proposal status updated to ${newStatus} and email sent successfully!`);

        } catch (error: any) { // Explicitly type the error
            console.error("Error updating proposal status:", error);
            setStatusUpdateMessage(`Error updating proposal status: ${error.message}`);
        } finally {
            setIsUpdatingStatus(false);
            setTimeout(() => setStatusUpdateMessage(null), 5000);
        }
    }, [isUpdatingStatus]);

    return (
        <DashboardContent
            eventProposals={eventProposals}
            loading={loading}
            selectedProposal={selectedProposal}
            isUpdatingStatus={isUpdatingStatus}
            statusUpdateMessage={statusUpdateMessage}
            closePopup={closePopup}
            updateProposalStatus={updateProposalStatus}
        />
    );
}
