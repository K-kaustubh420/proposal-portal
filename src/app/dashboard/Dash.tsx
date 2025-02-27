"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie } from 'react-chartjs-2';
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
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

const monthlySubmissionsData = [60, 55, 40, 85, 64, 70, 94, 34, 78, 54, 76, 56];

const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Monthly Submissions',
        data: monthlySubmissionsData,
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
    location?: string; // Optional location property
}

export default function EventPortal() {
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
                    location: data.eventLocation, // Assuming location field is 'eventLocation'
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

    const approvedProposalsCount = eventProposals.filter(p => p.status === 'Approved').length;
    const pendingProposalsCount = eventProposals.filter(p => p.status === 'Pending').length;
    const rejectedProposalsCount = eventProposals.filter(p => p.status === 'Rejected').length;
    const totalProposalsCount = eventProposals.length;

    const pieData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
            label: 'Proposal Status',
            data: [approvedProposalsCount, pendingProposalsCount, rejectedProposalsCount],
            backgroundColor: ['#A78BFA', '#F9A8D4', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 5
        }],
    };

    const recentApprovedProposals = eventProposals.filter(p => p.status === 'Approved').slice(-3).reverse();
    const recentAppliedProposals = eventProposals.filter(p => p.status === 'Pending').slice(-3).reverse();

    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
    }, []);

    const updateProposalStatus = useCallback(async (proposalId: string, newStatus: string) => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        try {
            const proposalDocRef = doc(db, 'eventProposals', proposalId);
            await updateDoc(proposalDocRef, { proposalStatus: newStatus });
            setEventProposals(currentProposals =>
                currentProposals.map(proposal =>
                    proposal.id === proposalId ? { ...proposal, status: newStatus } : proposal
                )
            );
            setSelectedProposal(null);
        } catch (error) {
            console.error("Error updating proposal status:", error);
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [isUpdatingStatus]);

    if (loading) {
        return <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex justify-center items-center">Loading proposals...</div>;
    }

    return (
        <><div style={{ backgroundImage: "url('/tp.jpg')" }}>
            <div className={`bg-gray-100 bg-opacity-90 min-h-screen font-sans text-gray-900 ${selectedProposal ? 'blur-sm' : ''}`}>
                <div className="p-6 max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-700">Welcome</h1>
                            <p className="text-gray-500 text-sm">Snapshot of event proposals</p>
                        </div>
                        <div>
                            <select className="select select-bordered select-sm bg-white text-gray-700">
                                <option disabled defaultValue>Yearly</option>
                                <option>Monthly</option>
                                <option>Weekly</option>
                            </select>
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
                                    <Line data={lineData} options={lineOptions} />
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
                                                    <th>Organizer</th>
                                                    <th>Location</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eventProposals.map((proposal) => (
                                                    <tr key={proposal.id}>
                                                        <td>{proposal.title}</td>
                                                        <td>{proposal.organizer}</td>
                                                        <td>{proposal.location || 'N/A'}</td>
                                                        <td>{proposal.date}</td>
                                                        <td>
                                                            <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : 'error'}`}>{proposal.status}</div>
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
                                    <Pie data={pieData} options={pieDataOptions} />
                                </div>
                            </div>

                            {/* Recently Applied Proposals List */}
                            <div className="card shadow-md rounded-lg bg-white">
                                <div className="card-body">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="card-title text-lg font-bold text-gray-700">Recently Applied Proposals</h2>
                                        <a href="#" className="text-sm text-blue-500 hover:underline">See All Applied</a>
                                    </div>
                                    <div className="space-y-3">
                                        {recentAppliedProposals.map(proposal => (
                                            <div key={proposal.id} className="flex items-center justify-between" onClick={() => handleProposalClick(proposal)} style={{ cursor: 'pointer' }}>
                                                <div className="flex items-center">
                                                    <div className="avatar mr-3">
                                                        <div className="mask mask-squircle w-8 h-8">
                                                            <img src={`/avatar${(proposal.id + 1) % 3 + 1}.png`} alt="Avatar" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-600">{proposal.organizer}</div>
                                                        <div className="text-sm text-gray-500">{proposal.title}</div>
                                                    </div>
                                                </div>
                                                <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : 'error'}`}>{proposal.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                             {/* Recently Approved Proposals List */}
                             <div className="card shadow-md rounded-lg bg-white">
                                <div className="card-body">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="card-title text-lg font-bold text-gray-700">Recently Approved Proposals</h2>
                                        <a href="#" className="text-sm text-blue-500 hover:underline">See All Approved</a>
                                    </div>
                                    <div className="space-y-3">
                                        {recentApprovedProposals.map(proposal => (
                                            <div key={proposal.id} className="flex items-center justify-between" onClick={() => handleProposalClick(proposal)} style={{ cursor: 'pointer' }}>
                                                <div className="flex items-center">
                                                    <div className="avatar mr-3">
                                                        <div className="mask mask-squircle w-8 h-8">
                                                            <img src={`/avatar${proposal.id % 3 + 1}.png`} alt="Avatar" />
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
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
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

                        <div className="mt-6 flex justify-end space-x-2">
                            {selectedProposal.status !== 'Approved' && (
                                <>
                                    <button
                                        onClick={() => updateProposalStatus(selectedProposal.id, 'Rejected')}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        disabled={isUpdatingStatus}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => updateProposalStatus(selectedProposal.id, 'Approved')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        disabled={isUpdatingStatus}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            )}
        </div> </>
    );
}
