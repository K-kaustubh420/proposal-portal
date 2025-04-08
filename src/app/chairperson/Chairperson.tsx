// chairperson dashboard.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ScriptableScaleContext } from 'chart.js';
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
    GridLineOptions
} from 'chart.js';
import {
    ListChecks,
    Clock,
    XCircle,
    CheckCircle,
    Info,
} from 'lucide-react';
import { db, app } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc, DocumentData, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import Calendar from './Calendar';
import PopupCard from './PopupCard';

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
            grid: {
                color: (context: ScriptableScaleContext) => {
                    if (context.tick.value === undefined) {
                        return 'rgba(0,0,0,0)';
                    }
                    if (context.index % 2 === 0) {
                        return 'rgba(203, 213, 224, 0.5)';
                    } else {
                        return 'rgba(0, 0, 0, 0)';
                    }
                },
                lineWidth: (context: ScriptableScaleContext) => {
                    if (context.tick.value === undefined) {
                        return 0;
                    }
                    if (context.index % 2 === 0) {
                        return 1;
                    }
                    return 0;
                }
            } satisfies Partial<GridLineOptions>,
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
    clarificationMessage?: string;
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
    clarificationMessage?: string;
}

const LineChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
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
        </select>
    );
}

const DashboardContent: React.FC<{
    eventProposals: Proposal[];
    loading: boolean;
    selectedProposal: Proposal | null;
    isUpdatingStatus: boolean;
    statusUpdateMessage: string | null;
    handleProposalClick: (proposal: Proposal) => void;
    closePopup: () => void;
    updateProposalStatus: (proposal: Proposal, newStatus: string, clarificationMessage?: string) => Promise<void>;
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
    const approvedProposals = eventProposals.filter(p =>
        p.status === 'ApprovedByChair' ||
        p.status === 'ApprovedByAssociateChair' ||
        p.status === 'AwaitingAssociateChairClarification'
    );
    const approvedCount = approvedProposals.length;

    const pieData = {
        labels: ['Approved'],
        datasets: [{
            label: 'Proposal Status',
            data: [approvedCount],
            backgroundColor: ['#A78BFA'],
            borderWidth: 0,
            hoverOffset: 5
        }],
    };

    const [showLineChart, setShowLineChart] = useState(false);
    const [showTable, setShowTable] = useState(true);

    const monthlyCounts = useMemo(() => {
        const counts = Array(12).fill(0);
        eventProposals.forEach(proposal => {
            if (proposal.date) {
                const proposalDate = new Date(proposal.date);
                if (!isNaN(proposalDate.getTime())) {
                    counts[proposalDate.getMonth()]++;
                } else {
                    console.error("Invalid date format:", proposal.date);
                }
            } else {
                console.warn("Proposal missing date:", proposal);
            }
        });
        return counts;
    }, [eventProposals]);

    const updatedLineData = useMemo(() => ({
        ...lineData,
        datasets: [{
            ...lineData.datasets[0],
            data: monthlyCounts,
        }],
    }), [monthlyCounts]);

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
                        </div>

                        <div className="grid grid-cols-1 w-auto lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="card shadow-md rounded-lg bg-white">
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
                                                                    <div className={`badge badge-sm ${
                                                                        proposal.status === 'ApprovedByChair' ? 'badge-success' :
                                                                            proposal.status === 'ApprovedByAssociateChair' ? 'badge-info' :
                                                                            'badge-warning'
                                                                    }`}>
                                                                        {proposal.status === 'ApprovedByChair' ? 'Approved' :
                                                                            proposal.status === 'ApprovedByAssociateChair' ? 'Pending Approval' :
                                                                            'Awaiting Clarification'}
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
                                                <Calendar />
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
                                            <LineChart data={updatedLineData} options={lineOptions} />
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
                <PopupCard
                    proposal={selectedProposal}
                    onClose={closePopup}
                    onUpdateStatus={(newStatus, clarificationMessage) => updateProposalStatus(selectedProposal, newStatus, clarificationMessage)}
                    isUpdatingStatus={isUpdatingStatus}
                    statusUpdateMessage={statusUpdateMessage}
                    showReject={false}
                    showRequestInfo={true}
                />
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
    const [userDepartments, setUserDepartments] = useState<string[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);

    const chairEmailDepartmentMap = useMemo(() => ({
        "kn3959@srmist.edu.in": ["Ctech", "Cintel" ],
    }), []);

    const fetchProposals = useCallback(async () => {
        console.log("fetchProposals CALLED in Chairperson with departments:", userDepartments);
        setLoading(true);
        try {
            if (userDepartments.length === 0) {
                console.warn("No departments assigned to this Chair.");
                setEventProposals([]);
                return;
            }
            const q = query(
                collection(db, 'eventProposals'),
                where("organizingDepartment", "in", userDepartments),
                where("proposalStatus", "in", ["ApprovedByAssociateChair", "AwaitingAssociateChairClarification"])
            );
            const proposalSnapshot = await getDocs(q);
            const proposalsList = proposalSnapshot.docs.map(doc => {
                const data = doc.data() as FirestoreProposal;
                const proposal = {
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
                    clarificationMessage: data.clarificationMessage || '',
                };
                console.log("Fetched proposal:", proposal);
                return proposal;
            });
            setEventProposals(proposalsList);
            console.log("Set eventProposals:", proposalsList);
        } catch (error) {
            console.error("Error fetching proposals:", error);
            setStatusUpdateMessage("Error fetching proposals. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [userDepartments]);

    useEffect(() => {
        const authInstance = getAuth(app);
        const unsubscribe = onAuthStateChanged(authInstance, (user: User | null) => {
            if (user && user.email) {
                const email = user.email;
                if (chairEmailDepartmentMap.hasOwnProperty(email)) {
                    setUserDepartments(chairEmailDepartmentMap[email as keyof typeof chairEmailDepartmentMap]);
                    setUserRole('Chair');
                    console.log("User Departments set to:", chairEmailDepartmentMap[email as keyof typeof chairEmailDepartmentMap]);
                } else {
                    setUserDepartments([]);
                    setUserRole(null);
                    console.log("No departments assigned for email:", email);
                }
            } else {
                setUserDepartments([]);
                setUserRole(null);
                console.log("No user logged in");
            }
        });
        return () => unsubscribe();
    }, [chairEmailDepartmentMap]);

    useEffect(() => {
        if (userDepartments.length > 0) {
            fetchProposals();
        }
    }, [fetchProposals, userDepartments]);

    const handleProposalClick = useCallback((proposal: Proposal) => {
        setSelectedProposal(proposal);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedProposal(null);
        setStatusUpdateMessage(null);
    }, []);

    const updateProposalStatus = useCallback(async (proposalToUpdate: Proposal, newStatus: string, clarificationMessage?: string) => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        setStatusUpdateMessage('Updating status...');

        try {
            if (!userDepartments.includes(proposalToUpdate.organizer)) {
                alert("You are not authorized to modify this proposal.");
                return;
            }

            let updatedStatus = newStatus;
            if (newStatus === 'Approved') {
                updatedStatus = 'Approved';
            } else if (newStatus === 'Request Info') {
                updatedStatus = 'AwaitingAssociateChairClarification'; // Or maybe 'AwaitingChairClarification' - confirm your desired status
            }

            setEventProposals(currentProposals =>
                currentProposals.map(proposal => {
                    if (proposal.id === proposalToUpdate.id) {
                        return {
                            ...proposal,
                            status: updatedStatus,
                            ...(clarificationMessage !== undefined ? { clarificationMessage } : {}), // Conditionally update clarificationMessage
                        };
                    }
                    return proposal;
                })
            );

            const proposalDocRef = doc(db, 'eventProposals', proposalToUpdate.id);
            const updateData: Partial<FirestoreProposal> = {
                proposalStatus: updatedStatus,
                ...(clarificationMessage !== undefined ? { clarificationMessage } : {}), // Conditionally update clarificationMessage
            };
            await updateDoc(proposalDocRef, updateData);

            console.log("Data sent to API from Chairperson:", { proposal: { ...proposalToUpdate, status: updatedStatus, clarificationMessage }, action: 'update' });
             console.log("Data being sent to /api/sendmail:", JSON.stringify({
                    proposal: { ...proposalToUpdate, status: updatedStatus, clarificationMessage },
                    action: 'update',
                    recipientRole: newStatus === 'Request Info' ? 'AssociateChair' : (newStatus === 'Approved' ? 'Convener' : 'Convener,HOD,AssociateChair'),
                }, null, 2));

            const response = await fetch('/api/sendmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposal: { ...proposalToUpdate, status: updatedStatus, clarificationMessage },
                    action: 'update',
                    recipientRole: newStatus === 'Request Info' ? 'AssociateChair' : (newStatus === 'Approved' ? 'Convener' : 'Convener,HOD,AssociateChair'),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(`API error: ${response.status} - ${data.error || 'Unknown error'}`);
            }
            if (data.error) {
                throw new Error(data.error);
            }
            setSelectedProposal(null);
            setStatusUpdateMessage(clarificationMessage
                ? `Sent clarification request: ${clarificationMessage}`
                : `Proposal status updated to ${newStatus} and email sent successfully!`
            );
        } catch (error: unknown) {
            console.error("Error updating proposal status:", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setStatusUpdateMessage(`Error updating proposal status: ${errorMessage}`);
        } finally {
            setIsUpdatingStatus(false);
            setTimeout(() => setStatusUpdateMessage(null), 5000);
        }
    }, [isUpdatingStatus, fetchProposals, userDepartments]);

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