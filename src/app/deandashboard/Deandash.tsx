"use client";
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ScriptableScaleContext } from 'chart.js'; // CORRECT IMPORT
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
    TooltipItem,
    ChartOptions,
    GridLineOptions // Import GridLineOptions
} from 'chart.js';
import {
    ListChecks,
    Clock,
    XCircle,
    CheckCircle,
    Info,
    X,
} from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc, DocumentData } from 'firebase/firestore';
import Calendar from './Calendar'; // Import the Calendar component


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

// --- Chart Options  ---
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
            grid: { // No type assertion needed here!
                color: (context: ScriptableScaleContext) => { // Explicitly type context
                    if (context.tick.value === undefined) {
                        return 'rgba(0,0,0,0)';
                    }
                    if (context.index % 2 === 0) {
                        return 'rgba(203, 213, 224, 0.5)';
                    } else {
                        return 'rgba(0, 0, 0, 0)';
                    }
                },
                lineWidth: (context: ScriptableScaleContext) => {  // Explicitly type context
                    if (context.tick.value === undefined) {
                        return 0;
                    }
                    if (context.index % 2 === 0) {
                        return 1;
                    }
                    return 0;
                }
            } satisfies Partial<GridLineOptions>, // Use satisfies
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

// --- Interfaces and Types ---

interface FirestoreProposal extends DocumentData {
    eventTitle: string;
    organizingDepartment: string;
    eventDate: string;
    proposalStatus?: string;
    category: string;
    estimatedBudget: number;
    convenerEmail: string;
    eventDescription: string;
    eventLocation?: string;
    convenerName: string;
    chiefGuestName?: string;
    chiefGuestDesignation?: string;
    events?: { eventTitle: string }[];
    tags?: string[];
}

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
    events?: { eventTitle: string }[];
    tags?: string[];
}

// --- Dynamic Imports ---
const LineChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

const PieChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), {
    ssr: false,
    loading: () => <p>Loading chart...</p>
});

// --- Helper Components  ---

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
        </select>
    );
}

// --- Dashboard Content ---
const DashboardContent: React.FC<{
    eventProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    isUpdatingStatus: boolean;
    statusUpdateMessage: string | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
    updateProposalStatus: (proposal: Proposal, newStatus: string, newTag?: string) => Promise<void>;
}> = ({
    eventProposals,
    loading,
    selectedProposal,
    isUpdatingStatus,
    statusUpdateMessage,
    handleProposalClick,
    closePopup,
    updateProposalStatus
}) => {

    const approvedProposals = eventProposals.filter(p => p.status === 'Approved');
    const approvedCount = approvedProposals.length;
    const reviewCount = approvedProposals.filter(p => p.tags?.includes('Review')).length;
    const rejectedCount = approvedProposals.filter(p => p.tags?.includes('Rejected')).length;
    const doneCount = approvedProposals.filter(p => p.tags?.includes('Done')).length;

    const pieData = {
        labels: ['Approved', 'Review', 'Rejected', 'Done'],
        datasets: [{
            label: 'Proposal Status',
            data: [approvedCount - reviewCount - rejectedCount - doneCount, reviewCount, rejectedCount, doneCount],
            backgroundColor: ['#A78BFA', '#3AB7BF', '#EF4444', '#82E0AA'],
            borderWidth: 0,
            hoverOffset: 5
        }],
    };

    const [showLineChart, setShowLineChart] = useState(false);
    const [showTable, setShowTable] = useState(true); // State to control table/calendar display


    if (loading) {
        return <LoadingComponent />;
    }

    if (approvedProposals.length === 0) {
        return <NoProposalsComponent />;
    }

    const getBadgeClass = (tags?: string[]) => {
        if (!tags) {
            return 'badge-success';
        }
        if (tags.includes('Done')) return 'badge-primary';
        if (tags.includes('Review')) return 'badge-info';
        if (tags.includes('Rejected')) return 'badge-error';
        return 'badge-success';
    };

    const getBadgeText = (tags?: string[]) => {
        if (!tags) {
            return 'Approved';
        }
        if (tags.includes('Done')) return 'Done';
        if (tags.includes('Review')) return 'Review';
        if (tags.includes('Rejected')) return 'Rejected';
        return 'Approved';
    };

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
                                <h1 className="text-2xl font-bold text-blue-700">Approved Proposals</h1>
                                <p className="text-gray-500 text-sm">Manage approved event proposals</p>
                            </div>
                            <div>
                                <YearlyDropdown />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card stat shadow-md rounded-lg border-t-4 border-blue-500 bg-white">
                                <div className="stat-figure text-blue-500"><ListChecks className="h-6 w-6" /></div>
                                <div className="stat-value">{approvedCount.toLocaleString()}</div>
                                <div className="stat-title">Total Approved</div>
                            </div>
                            <div className="card stat shadow-md rounded-lg border-t-4 border-green-500 bg-white">
                                <div className="stat-figure text-green-500"><CheckCircle className="h-6 w-6" /></div>
                                <div className="stat-value">{doneCount.toLocaleString()}</div>
                                <div className="stat-title">Done</div>
                            </div>
                            <div className="card stat shadow-md rounded-lg border-t-4 border-red-500 bg-white">
                                <div className="stat-figure text-red-500"><XCircle className="h-6 w-6" /></div>
                                <div className="stat-value">{rejectedCount.toLocaleString()}</div>
                                <div className="stat-title">Rejected</div>
                            </div>
                            <div className="card stat shadow-md rounded-lg border-t-4 border-info bg-white">
                                <div className="stat-figure text-info"><Clock className="h-6 w-6" /></div>
                                <div className="stat-value">{reviewCount.toLocaleString()}</div>
                                <div className="stat-title">Review</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 w-auto lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="card  shadow-md rounded-lg bg-white">
                                    <div className="card-body">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="card-title text-lg font-bold text-gray-700">
                                            {showTable ? "Approved Proposals Inbox" : "Calendar View"}
                                        </h2>
                                        <div className="form-control">
                                            <label className="label cursor-pointer">
                                                <span className="label-text">Show Calendar</span>
                                                <input
                                                    type="checkbox"
                                                    className="toggle"
                                                    checked={!showTable}
                                                    onChange={() => setShowTable(!showTable)}
                                                    aria-label='Show Calendar'
                                                />
                                            </label>
                                        </div>
                                     </div>
                                        {/* Content will go here based on showTable */}
                                        {showTable ? (
                                            <div className="overflow-x-auto">
                                                <table className="table table-compact w-full">
                                                    <thead>
                                                        <tr>
                                                            <th></th>
                                                            <th>Status</th>
                                                            <th>Title</th>
                                                            <th>Organizing Department</th>
                                                            <th>Convener</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {approvedProposals.map((proposal) => (
                                                            <tr key={proposal.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleProposalClick(proposal)}>
                                                                <td>
                                                                    <input type="checkbox" className="checkbox" aria-label='checkbox' />
                                                                </td>
                                                                <td>
                                                                    <div className={`badge badge-sm ${getBadgeClass(proposal.tags)}`}>
                                                                        {getBadgeText(proposal.tags)}
                                                                    </div>
                                                                </td>
                                                                <td>{proposal.title}</td>
                                                                <td>{proposal.organizer}</td>
                                                                <td>{proposal.convenerName}</td>
                                                                <td>{new Date(proposal.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                           <div className="overflow-x-auto w-full">
                                                <Calendar/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-8">
                                <div className="card shadow-md rounded-lg p-4 md:p-6 bg-white">
                                    <div className="flex justify-between mb-3">
                                        <div className="flex justify-center items-center">
                                            <h5 className="text-xl font-bold leading-none text-gray-700 pe-1">Proposal Status</h5>
                                            <button
                                                onClick={() => setShowLineChart(!showLineChart)}
                                                className="ml-2 btn btn-xs btn-outline"
                                            >
                                                {showLineChart ? "Show Pie Chart" : "Show Line Chart"}
                                            </button>
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
                                        {showLineChart ? (
                                            <LineChart data={lineData} options={lineOptions} />
                                        ) : (
                                            <PieChart data={pieData} options={pieDataOptions} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedProposal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProposal.title}</h2>
                                <button onClick={closePopup} className="text-gray-600 hover:text-gray-800" aria-label='closepopup'>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-700"><span className="font-semibold">Organizing Department:</span> {selectedProposal.organizer}</p>
                                <p className="text-gray-700"><span className="font-semibold">Convener:</span> {selectedProposal.convenerName}</p>
                                <p className="text-gray-700"><span className="font-semibold">Convener Email:</span> {selectedProposal.convenerEmail}</p>
                                <p className="text-gray-700"><span className="font-semibold">Date:</span> {new Date(selectedProposal.date).toLocaleDateString("en-GB")}</p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`badge badge-sm ${getBadgeClass(selectedProposal.tags)}`}>
                                        {getBadgeText(selectedProposal.tags)}
                                    </span>
                                </p>
                                <p className="text-gray-700"><span className="font-semibold">Category:</span> {selectedProposal.category}</p>
                                <p className="text-gray-700"><span className="font-semibold">Estimated Cost:</span> ₹{selectedProposal.cost.toLocaleString()}</p>
                                {selectedProposal.chiefGuestName && (
                                    <>
                                        <p className="text-gray-700"><span className="font-semibold">Chief Guest:</span> {selectedProposal.chiefGuestName}</p>
                                        <p className="text-gray-700"><span className="font-semibold">Chief Guest Designation:</span> {selectedProposal.chiefGuestDesignation}</p>
                                    </>
                                )}
                                <p className="text-gray-700 mt-4"><span className="font-semibold">Description:</span></p>
                                <p className="text-gray-700">{selectedProposal.description}</p>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => updateProposalStatus(selectedProposal, 'Approved', 'Review')}
                                    className="btn btn-info text-white"
                                    disabled={isUpdatingStatus || selectedProposal.tags?.includes('Review')}
                                >
                                    Mark for Review
                                </button>
                                <button
                                    onClick={() => updateProposalStatus(selectedProposal, 'Approved', 'Done')}
                                    className="btn btn-success text-white"
                                    disabled={isUpdatingStatus || selectedProposal.tags?.includes('Done')}
                                >
                                    Approve & Mark as Done
                                </button>
                                <button
                                    onClick={() => updateProposalStatus(selectedProposal, 'Approved', 'Rejected')}
                                    className="btn btn-error text-white"
                                    disabled={isUpdatingStatus || selectedProposal.tags?.includes('Rejected')}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        updateProposalStatus(selectedProposal, 'Approved', 'ReviewAndDone');

                                    }}
                                    className="btn btn-primary text-white"
                                    disabled={isUpdatingStatus || selectedProposal.tags?.includes('Review') || selectedProposal.tags?.includes('Done')}
                                >
                                    Mark for Review & Done
                                </button>
                            </div>

                            {statusUpdateMessage && (
                                <div className={`mt-4 p-3 rounded-md ${statusUpdateMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {statusUpdateMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default function EventPortal() {
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

    const fetchProposals = useCallback(async () => {
        setLoading(true);
        try {
            const proposalsCollection = collection(db, 'eventProposals');
            const proposalSnapshot = await getDocs(proposalsCollection);
            const proposalsList = proposalSnapshot.docs.map(doc => {
                const data = doc.data() as FirestoreProposal;
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
                    events: data.events || [],
                    tags: data.tags || [],
                };
            });
            setEventProposals(proposalsList);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            setStatusUpdateMessage("Error fetching proposals.  Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
        setStatusUpdateMessage(null);
    }, []);
    const updateProposalStatus = useCallback(async (proposalToUpdate: Proposal, newStatus: string, newTag?: string) => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        setStatusUpdateMessage('Updating status...');

        try {
            setEventProposals(currentProposals =>
                currentProposals.map(proposal => {
                    if (proposal.id === proposalToUpdate.id) {
                        let updatedTags = proposal.tags || [];
                        if (newTag) {
                            if (newTag === 'ReviewAndDone') {
                                updatedTags = updatedTags.filter(tag => tag !== 'Review');
                                if (!updatedTags.includes('Done')) updatedTags.push('Done');
                                if (!updatedTags.includes('Review')) updatedTags.push('Review');
                            } else if (newTag === 'Done' && updatedTags.includes("Review")) {
                                updatedTags = updatedTags.filter(tag => tag !== 'Review');
                                if (!updatedTags.includes('Done')) updatedTags.push('Done');
                            } else if (newTag === 'Review' && updatedTags.includes("Done")) {
                                if (!updatedTags.includes('Review')) updatedTags.push('Review');
                            } else if (!updatedTags.includes(newTag)) {
                                updatedTags.push(newTag);
                            } else {
                                updatedTags = updatedTags.filter(tag => tag !== newTag);
                            }
                        }
                        return { ...proposal, status: newStatus, tags: updatedTags };
                    }
                    return proposal;
                })
            );

            setSelectedProposal(null);

            const proposalDocRef = doc(db, 'eventProposals', proposalToUpdate.id);
            const updateData: Partial<FirestoreProposal> = { proposalStatus: newStatus };

            if (newTag) {
                const docSnap = await getDoc(proposalDocRef);
                if (docSnap.exists()) {
                    const currentTags = docSnap.data().tags || [];
                    let updatedTags = [...currentTags];

                    if (newTag === 'ReviewAndDone') {
                        updatedTags = updatedTags.filter(tag => tag !== 'Review');
                        if (!updatedTags.includes('Done')) updatedTags.push('Done');
                        if (!updatedTags.includes('Review')) updatedTags.push('Review');
                    } else if (newTag === 'Done' && updatedTags.includes("Review")) {
                        updatedTags = updatedTags.filter(tag => tag !== 'Review');
                        if (!updatedTags.includes('Done')) updatedTags.push('Done');
                    } else if (newTag === 'Review' && updatedTags.includes("Done")) {
                        if (!updatedTags.includes('Review')) updatedTags.push('Review');
                    } else if (!updatedTags.includes(newTag)) {
                        updatedTags.push(newTag);
                    } else {
                        updatedTags = updatedTags.filter(tag => tag !== newTag);
                    }

                    updateData.tags = updatedTags;
                }
            }

            await updateDoc(proposalDocRef, updateData);

            const updatedProposal = { ...proposalToUpdate, status: newStatus, tags: updateData.tags || [] };
            const response = await fetch('/api/sendmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposal: updatedProposal, action: 'update' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${data.error || 'Unknown error'}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setStatusUpdateMessage(newTag
                ? (newTag === 'ReviewAndDone'
                    ? `Proposal status updated to Review and then marked as Done. Email sent successfully!`
                    : `Proposal tagged as ${newTag} and email sent successfully!`)
                : `Proposal status updated to ${newStatus} and email sent successfully!`
            );

        } catch (error: unknown) {
            console.error("Error updating proposal status:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setStatusUpdateMessage(`Error updating proposal status: ${errorMessage}`);

            fetchProposals();

        } finally {
            setIsUpdatingStatus(false);
            setTimeout(() => setStatusUpdateMessage(null), 5000);
        }
    }, [isUpdatingStatus, fetchProposals]);


    return (
        <DashboardContent
            eventProposals={eventProposals}
            loading={loading}
            selectedProposal={selectedProposal}
            isUpdatingStatus={isUpdatingStatus}
            statusUpdateMessage={statusUpdateMessage}
            handleProposalClick={handleProposalClick}
            closePopup={closePopup}
            updateProposalStatus={updateProposalStatus}
        />
    );
}