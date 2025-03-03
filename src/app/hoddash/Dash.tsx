"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
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
    X
} from 'lucide-react';
import { db, auth, app } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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


//
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
    chiefGuestName?: string;
    chiefGuestDesignation?: string;
    designation: string;
    detailedBudget: number;
    durationEvent: string;
    estimatedBudget: number;
    eventDate: string;
    eventDescription: string;
    eventEndDate: string;
    eventStartDate: string;
    eventTitle: string;
    fundingDetails?: string;
    organizingDepartment: string;
    pastEvents?: string[];
    proposalStatus: string;
    relevantDetails?: string;
    sponsorshipDetails?: string;
    sponsorshipDetailsRows?: any[];
    submissionTimestamp: string;
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

// Loading Component
const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading proposals...
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
            <option value="Yearly">Yearly</option>
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Semesterwise">Semesterwise</option>
            <option value="AcademicYearly">Academic Yearly</option>
        </select>
    );
}

// Dashboard content component
const DashboardContent: React.FC<{
    eventProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
}> = ({
    eventProposals,
    loading,
    selectedProposal,
    handleProposalClick,
    closePopup,
}) => {

    // Calculate proposal counts
    const approvedProposalsCount = eventProposals.filter(p => p.status === 'Approved').length;
    const pendingProposalsCount = eventProposals.filter(p => p.status === 'Pending').length;
    const rejectedProposalsCount = eventProposals.filter(p => p.status === 'Rejected').length;
    const reviewProposalsCount = eventProposals.filter(p => p.status === 'Review').length;
    const totalProposalsCount = eventProposals.length;

    // Prepare data for pie chart
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

    // Get recent proposals
    const recentApprovedProposals = eventProposals.filter(p => p.status === 'Approved').slice().reverse();
    const recentAppliedProposals = eventProposals.filter(p => p.status === 'Pending').slice().reverse();

    // Render loading component
    if (loading) {
        return <LoadingComponent />;
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
                                                    {eventProposals.length > 0 ? (
                                                        eventProposals.map((proposal) => (
                                                            <tr onClick={() => handleProposalClick(proposal)} key={proposal.id}>
                                                                <td>{proposal.title}</td>
                                                                <td>{proposal.organizer}</td>
                                                                <td>{proposal.convenerName}</td>
                                                                <td>{new Date(proposal.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
                                                                <td>
                                                                    <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : proposal.status === 'Rejected' ? 'error' : proposal.status === 'Review' ? 'info' : ''}`}>{proposal.status}</div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-center italic">No proposals submitted yet. <a href="/create-proposal" className="text-blue-500 hover:underline">Create a proposal now?</a></td>
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

                                {/* Recently Applied Proposals List */}
                                <div className="card shadow-md rounded-lg bg-white">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="card-title text-lg font-bold text-gray-700">Recently Applied Proposals</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {recentAppliedProposals.map(proposal => (
                                                <div
                                                    key={proposal.id}
                                                    className="flex items-center justify-between cursor-pointer"
                                                    onClick={() => handleProposalClick(proposal)}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="avatar mr-3">
                                                            <div className="mask mask-squircle w-8 h-8">
                                                                {proposal.id % 3 === 0 ? (
                                                                    <img
                                                                        src={`/avatar${(proposal.id % 3) + 1}.png`}
                                                                        onError={(e) => (e.target.style.display = "none")}
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
                                                    <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : 'error'}`}>
                                                        {proposal.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            className="bg-blue-50 rounded-lg border-t-4 border-blue-800 shadow-md shadow-blue-950 p-8 max-w-2xl w-full"
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

                            <div className="space-y-4 overflow-y-auto max-h-[500px]">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
                                        <p className="text-gray-600">{format(new Date(selectedProposal.date), 'dd-MM-yyyy hh:mm a')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Status:</p>
                                        <p className="text-gray-600">{selectedProposal.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Category:</p>
                                        <p className="text-gray-600">{selectedProposal.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Cost:</p>
                                        <p className="text-gray-600">{selectedProposal.cost ? `$${selectedProposal.cost.toLocaleString()}` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Email:</p>
                                        <p className="text-gray-600">{selectedProposal.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Convener:</p>
                                        <p className="text-gray-600">{selectedProposal.convenerName} ({selectedProposal.convenerEmail})</p>
                                    </div>
                                    {selectedProposal.chiefGuestName && (
                                        <div>
                                            <p className="text-gray-700 font-semibold">Chief Guest:</p>
                                            <p className="text-gray-600">{selectedProposal.chiefGuestName} ({selectedProposal.chiefGuestDesignation})</p>
                                        </div>
                                    )}
                                    {selectedProposal.designation && (
                                        <div>
                                            <p className="text-gray-700 font-semibold">Designation:</p>
                                            <p className="text-gray-600">{selectedProposal.designation}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-gray-700 font-semibold">Duration:</p>
                                        <p className="text-gray-600">{selectedProposal.durationEvent}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">Start Date:</p>
                                        <p className="text-gray-600">{format(new Date(selectedProposal.eventStartDate), 'dd-MM-yyyy hh:mm a')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-semibold">End Date:</p>
                                        <p className="text-gray-600">{format(new Date(selectedProposal.eventEndDate), 'dd-MM-yyyy hh:mm a')}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-700 font-semibold">Description:</p>
                                        <p className="text-gray-600">{selectedProposal.description}</p>
                                    </div>
                                </div>

                                {selectedProposal.pastEvents && (
                                    <div className="mt-4 p-4 rounded-md">
                                        <p className="text-gray-700 font-semibold">Past Events:</p>
                                        <p className="text-gray-600 whitespace-pre-wrap">{selectedProposal.pastEvents}</p>
                                    </div>
                                )}

                                {selectedProposal.relevantDetails && (
                                    <div className="mt-4 p-4 rounded-md">
                                        <p className="text-gray-700 font-semibold">Relevant Details:</p>
                                        <p className="text-gray-600 whitespace-pre-wrap">{selectedProposal.relevantDetails}</p>
                                    </div>
                                )}

                                {selectedProposal.sponsorshipDetails && Array.isArray(selectedProposal.sponsorshipDetails) && (
                                    <div className="mt-4 p-4 rounded-md">
                                        <p className="text-gray-700 font-semibold">Sponsorship Details:</p>
                                        <ul className="text-gray-600 list-disc list-inside">
                                            {selectedProposal.sponsorshipDetails.map((sponsor, index) => (
                                                <li key={index}>{sponsor}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedProposal.detailedBudget && selectedProposal.detailedBudget.length > 0 && (
                                    <div className="mt-4  p-4 rounded-md">
                                        <p className="text-gray-700 font-semibold">Detailed Budget:</p>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {selectedProposal.detailedBudget.map((item, index) => (
                                                <li key={index}>
                                                    {item.mainCategory} - {item.subCategory} (${item.totalAmount.toLocaleString()})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedProposal.fundingDetails && (
                                    <div className="mt-4  p-4 rounded-md">
                                        <p className="text-gray-700 font-semibold">Funding Details:</p>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {selectedProposal.fundingDetails.registrationFund && (
                                                <li><span className="font-semibold">Registration Fund:</span> ${selectedProposal.fundingDetails.registrationFund}</li>
                                            )}
                                            {selectedProposal.fundingDetails.sponsorshipFund && (
                                                <li><span className="font-semibold">Sponsorship Fund:</span> ${selectedProposal.fundingDetails.sponsorshipFund}</li>
                                            )}
                                            {selectedProposal.fundingDetails.universityFund && (
                                                <li><span className="font-semibold">University Fund:</span> ${selectedProposal.fundingDetails.universityFund}</li>
                                            )}
                                            {selectedProposal.fundingDetails.otherSourcesFund && (
                                                <li><span className="font-semibold">Other Sources:</span> ${selectedProposal.fundingDetails.otherSourcesFund}</li>
                                            )}
                                        </ul>
                                        {!selectedProposal.fundingDetails.registrationFund &&
                                            !selectedProposal.fundingDetails.sponsorshipFund &&
                                            !selectedProposal.fundingDetails.universityFund &&
                                            !selectedProposal.fundingDetails.otherSourcesFund && (
                                                <p className="text-gray-600">No funding details available</p>
                                            )}
                                    </div>
                                )}

                                {selectedProposal.submissionTimestamp && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 font-semibold">Submitted On:</p>
                                        <p className="text-gray-600">{format(new Date(selectedProposal.submissionTimestamp), 'dd-MM-yyyy hh:mm a')}</p>
                                    </div>
                                )}
                            </div>


                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

// Main EventPortal component
export default function EventPortal() {
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [userDepartment, setUserDepartment] = useState<string | null>(null);

    const hodEmailDepartmentMap: { [key: string]: string } = {
        "hod.ctech.ktr.et@srmist.edu.in": "Ctech", // Use "Ctech" to match option value
        "hod.cintel.ktr.et@srmist.edu.in": "Cintel", // Use "Cintel" to match option value
    };

    const exceptionEmailDepartmentMap: { [key: string]: string } = {
        "kkaustubh92@gmail.com": "Ctech", // Assigning to Ctech as example
        "kk6682@srmist.edu.in": "Cintel",
        "kn3959@srmist.edu.in": "Ctech",
        "neupanekiran512@gmail.com": "Aerospace Engineering", // Example for another department
        "neupanekiran450@gmail.com": "Automobile Engineering", // Example for another department
        "namasteportraits@gmailcom": "Biomedical Engineering",
        "rn8638@srmist.edu.in": "Biotechnology",
    };


    const fetchProposals = useCallback(async (department: string | null = null) => {
        setLoading(true);
        try {
            let q = collection(db, 'eventProposals');
            if (department) {
                q = query(q, where("organizingDepartment", "==", department));
            }

            const proposalSnapshot = await getDocs(q);
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
                    chiefGuestName: data.chiefGuestName,
                    chiefGuestDesignation: data.chiefGuestDesignation,
                    designation: data.designation,
                    detailedBudget: data.detailedBudget,
                    durationEvent: data.durationEvent,
                    estimatedBudget: data.estimatedBudget,
                    eventEndDate: data.eventEndDate,
                    eventStartDate: data.eventStartDate,
                    fundingDetails: data.fundingDetails,
                    pastEvents: data.pastEvents,
                    relevantDetails: data.relevantDetails,
                    sponsorshipDetails: data.sponsorshipDetails,
                    sponsorshipDetailsRows: data.sponsorshipDetailsRows,
                    submissionTimestamp: data.submissionTimestamp,
                    ...data,
                };
            });
            setEventProposals(proposalsList);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const authInstance = getAuth(app);
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            let department = null;
            if (user && user.email) {
                if (hodEmailDepartmentMap[user.email]) {
                    department = hodEmailDepartmentMap[user.email];
                } else if (exceptionEmailDepartmentMap[user.email]) {
                    department = exceptionEmailDepartmentMap[user.email];
                }
                setUserDepartment(department);
            } else {
                setUserDepartment(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchProposals(userDepartment);
    }, [fetchProposals, userDepartment]);


    // Handlers for proposal actions
    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
    }, []);


    return (
        <DashboardContent
            eventProposals={eventProposals}
            loading={loading}
            selectedProposal={selectedProposal}
            handleProposalClick={handleProposalClick}
            closePopup={closePopup}
        />
    );
}