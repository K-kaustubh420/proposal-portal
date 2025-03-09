"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Line } from 'react-chartjs-2';
import { motion } from "framer-motion";
import Link from 'next/link';
import Image from "next/image";
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
    Filler,
    ChartOptions,
    Plugin
} from 'chart.js';
import {
    ListChecks,
    Clock,
    XCircle,
    CheckCircle,
    ArrowUpRight,
    X
} from 'lucide-react';
import { db, app } from '@/firebase/config';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { TooltipItem } from 'chart.js';

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

const chartAreaBackgroundColor: Plugin<'line'> = {
    id: 'chartAreaBackgroundColor',
    beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        ctx.save();
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
    },
};

const chartAreaBackgroundColorPie: Plugin<'pie'> = {
    id: 'chartAreaBackgroundColorPie',
    beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        ctx.save();
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
    },
};

const lineOptions: ChartOptions<'line'> = {
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
                label: (context: TooltipItem<'line'>) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
    },
    scales: {
        y: {
            type: 'linear',
            beginAtZero: true,
            grid: { color: '#CBD5E0', lineWidth: 1 },
            ticks: { color: '#4b5563', font: { size: 12 } }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#4b5563', font: { size: 12 } }
        }
    },
    elements: { line: { tension: 0.4 } }
};


const pieDataOptions: ChartOptions<'pie'> = {
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
                label: (context: TooltipItem<'pie'>) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
    },
};

const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Monthly Submissions',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    transport?: number;
    accommodation?: number;
    hall?: number;
    chiefGuestName?: string; // Add chiefGuestName to Proposal Interface
    chiefGuestDesignation?: string; // Add chiefGuestDesignation
    chiefGuestEmail?: string; // Add chiefGuestEmail
    chiefGuestPhone?: string; // Add chiefGuestPhone
    chiefGuestAddress?: string; // Add chiefGuestAddress
}

const LineChart = dynamic(() => Promise.resolve(Line), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

const PieChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

const LoadingComponent = () => (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">
        Loading proposals...
    </div>
);

function YearlyDropdown() {
    const [selectedYearly, setSelectedYearly] = useState("Yearly");
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYearly(event.target.value);
    };

    return (
        <select
            className="select select-bordered select-sm bg-white text-gray-700"
            value={selectedYearly}
            onChange={handleChange}
            aria-label='Yearly'
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

const MyDashboardContent: React.FC<{
    userProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
    currentUserEmail: string | null | undefined;
    setSelectedProposal: React.Dispatch<React.SetStateAction<Proposal | null>>;
    fetchUserProposals: (userEmail: string) => void;
}> = ({
    userProposals,
    loading,
    selectedProposal,
    handleProposalClick,
    closePopup,
    currentUserEmail,
    setSelectedProposal,
    fetchUserProposals
}) => {
    const approvedProposalsCount = userProposals.filter(p => p.status === 'Approved').length;
    const pendingProposalsCount = userProposals.filter(p => p.status === 'Pending').length;
    const rejectedProposalsCount = userProposals.filter(p => p.status === 'Rejected').length;
    const reviewProposalsCount = userProposals.filter(p => p.status === 'Review').length;
    const totalProposalsCount = userProposals.length;

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

    const recentAppliedProposals = userProposals.filter(p => p.status === 'Pending').slice().reverse();

    const monthlyCounts = Array(12).fill(0);
    userProposals.forEach(proposal => {
        if (proposal.date) {
            const proposalDate = new Date(proposal.date);
            if (!isNaN(proposalDate.getTime())) {
                monthlyCounts[proposalDate.getMonth()]++;
            } else {
                console.error("Invalid date format for proposal:", proposal);
            }
        } else {
            console.warn("Proposal is missing date:", proposal);
        }
    });

    const updatedLineData = {
        ...lineData,
        datasets: [{
            ...lineData.datasets[0],
            data: monthlyCounts,
        }],
    };

    const [chiefGuestSame, setChiefGuestSame] = useState(true);
    const [chiefGuestName, setChiefGuestName] = useState<string>('');
    const [chiefGuestDesignation, setChiefGuestDesignation] = useState<string>('');
    const [chiefGuestEmail, setChiefGuestEmail] = useState<string>('');
    const [chiefGuestPhone, setChiefGuestPhone] = useState<string>('');
    const [chiefGuestAddress, setChiefGuestAddress] = useState<string>('');

    useEffect(() => {
        if (selectedProposal) {
            // Initialize Chief Guest details from selectedProposal if available
            setChiefGuestName(selectedProposal.chiefGuestName || '');
            setChiefGuestDesignation(selectedProposal.chiefGuestDesignation || '');
            setChiefGuestEmail(selectedProposal.chiefGuestEmail || '');
            setChiefGuestPhone(selectedProposal.chiefGuestPhone || '');
            setChiefGuestAddress(selectedProposal.chiefGuestAddress || '');
        }
    }, [selectedProposal]);


    if (loading) {
        return <LoadingComponent />;
    }

    return (
        <>
            {/* ... (rest of your dashboard UI - charts, stats, tables) ... */}
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
                                <p className="text-gray-500 text-sm">Snapshot of your event proposals for {currentUserEmail}</p>
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
                                         {/* Pass the plugin to the plugins array */}
                                        <LineChart data={updatedLineData} options={lineOptions} plugins={[chartAreaBackgroundColor]} />
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

                                            <div id="data-tooltip-pie" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 tooltip dark:bg-slate-200">
                                                Status of your event proposals
                                                <div className="tooltip-arrow bg-white" data-popper-arrow></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-64 relative text-slate-800">
                                         {/* Pass the plugin here as well */}
                                        <PieChart data={pieData} options={pieDataOptions}  plugins={[chartAreaBackgroundColorPie]}/>
                                    </div>
                                </div>

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
                                                                    {typeof proposal.id === 'number' && (proposal.id % 3 === 0) ? (
                                                                        <Image
                                                                            src={`/avatar${(proposal.id % 3) + 1}.png`}
                                                                            alt={proposal.title || "Avatar"}
                                                                            width={32}  // Important: Set width and height for Next/Image
                                                                            height={32}
                                                                            placeholder="blur" // Optional: Add a blur placeholder
                                                                            blurDataURL="/placeholder.png" //  A very small, blurred version of your image
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
                            className="bg-blue-50 rounded-lg border-t-4 border-blue-800 shadow-md shadow-blue-950 p-8 max-w-2xl w-full max-h-full overflow-y-auto"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                        >
                            <div className="flex justify-between rounded-md items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Proposal Details</h2>
                                <button onClick={closePopup} className="text-gray-600 hover:text-gray-800" aria-label='closepopup'>
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
                                    <p className="text-gray-700 font-semibold">Status:</p>
                                    <p className="text-gray-600">{selectedProposal.status}</p>
                                </div>
                                {selectedProposal.status === 'Review' && (
                                    <div className="mt-6">
                                        <Link
                                            href={{ pathname: '/Proposal', query: { proposalId: selectedProposal.id, edit: 'true', eventTitle: selectedProposal.title, organizingDepartment:selectedProposal.organizer, eventDate: new Date(selectedProposal.date).toISOString(), category:selectedProposal.category, estimatedBudget:selectedProposal.cost, convenerEmail:selectedProposal.email, eventDescription:selectedProposal.description, eventLocation:selectedProposal.location, convenerName:selectedProposal.convenerName, convenerEmail1:selectedProposal.convenerEmail} }}
                                            className="btn btn-sm btn-primary rounded-full"
                                        >Edit and Resend</Link>
                                    </div>
                                )}

                                {selectedProposal.status === 'Approved' && (
                                    <>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-gray-700 text-sm font-semibold">Is Chief Guest the same?</p>
                                                <select
                                                    className="select select-bordered select-sm w-full bg-inherit"
                                                    onChange={(e) => setChiefGuestSame(e.target.value === 'yes')}
                                                    value={chiefGuestSame ? 'yes' : 'no'}
                                                    aria-label='Is Chief Guest the same?'
                                                >
                                                    <option value="yes">Yes</option>
                                                    <option value="no">No</option>
                                                </select>
                                            </div>
                                            {!chiefGuestSame && (
                                                <>
                                                    <div>
                                                        <p className="text-gray-700 text-sm font-semibold">Chief Guest Name:</p>
                                                        <input
                                                            type="text"
                                                            className="input input-bordered input-sm w-full bg-inherit"
                                                            value={chiefGuestName}
                                                            onChange={(e) => setChiefGuestName(e.target.value)}
                                                            aria-label='Cheif Guest name'
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 text-sm font-semibold">Designation:</p>
                                                        <input
                                                            type="text"
                                                            className="input input-bordered input-sm w-full bg-inherit"
                                                            value={chiefGuestDesignation}
                                                            onChange={(e) => setChiefGuestDesignation(e.target.value)}
                                                            aria-label='Cheif Guest designation'
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 text-sm font-semibold">Email:</p>
                                                        <input
                                                            type="email"
                                                            className="input input-bordered input-sm w-full bg-inherit"
                                                            value={chiefGuestEmail}
                                                            onChange={(e) => setChiefGuestEmail(e.target.value)}
                                                            aria-label='Email of cheif guest'
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 text-sm font-semibold">Phone:</p>
                                                        <input
                                                            type="tel"
                                                            className="input input-bordered input-sm w-full bg-inherit"
                                                            value={chiefGuestPhone}
                                                            onChange={(e) => setChiefGuestPhone(e.target.value)}
                                                            aria-label='cheif Guest Phone'
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 text-sm font-semibold">Address:</p>
                                                        <input
                                                            type="text"
                                                            className="input input-bordered input-sm w-full bg-inherit"
                                                            value={chiefGuestAddress}
                                                            onChange={(e) => setChiefGuestAddress(e.target.value)}
                                                            aria-label='Cheif Guest Address'
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="col-span-1 md:col-span-2 mt-4">
                                            <button
                                                className="btn btn-primary btn-sm w-full"
                                                onClick={async () => {
                                                    try {
                                                        const proposalRef = doc(db, 'eventProposals', selectedProposal.id);
                                                        await updateDoc(proposalRef, {
                                                            ...(chiefGuestSame ? {} : {
                                                                chiefGuestName: chiefGuestName,
                                                                chiefGuestDesignation: chiefGuestDesignation,
                                                                chiefGuestEmail: chiefGuestEmail,
                                                                chiefGuestPhone: chiefGuestPhone,
                                                                chiefGuestAddress: chiefGuestAddress,
                                                            }),
                                                        });
                                                        closePopup();
                                                        if (currentUserEmail) {
                                                            fetchUserProposals(currentUserEmail);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating proposal:", error);
                                                    }
                                                }}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default function MyDashboard() {
    const [userProposals, setUserProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null | undefined>(null);

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
            const proposalSnapshot = await getDocs(q);
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
                    chiefGuestName: data.chiefGuestName, // Include chiefGuestName in fetched proposal
                    chiefGuestDesignation: data.chiefGuestDesignation, // Include chiefGuestDesignation
                    chiefGuestEmail: data.chiefGuestEmail, // Include chiefGuestEmail
                    chiefGuestPhone: data.chiefGuestPhone, // Include chiefGuestPhone
                    chiefGuestAddress: data.chiefGuestAddress, // Include chiefGuestAddress
                    ...data,
                };
            }) as Proposal[];

            setUserProposals(filteredProposalsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserEmail) {
            fetchUserProposals(currentUserEmail);
        } else {
            setUserProposals([]);
            setLoading(false);
        }
    }, [fetchUserProposals, currentUserEmail]);

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
            currentUserEmail={currentUserEmail}
            setSelectedProposal={setSelectedProposal}
            fetchUserProposals={fetchUserProposals}
        />
    );
}