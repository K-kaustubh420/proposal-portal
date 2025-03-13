"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '@/firebase/config';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { X } from 'lucide-react';
import listPlugin from '@fullcalendar/list';
import { EventInput, EventClickArg } from '@fullcalendar/core'; // Import EventClickArg


interface FirestoreProposal extends DocumentData {
    eventTitle: string;
    organizingDepartment: string;
    eventDate: string; //  Consider using a consistent date format (e.g., "YYYY-MM-DD")
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
    date: string; //  Consider using a consistent date format
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

const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500 animate-spin">
            {/* You can replace this with a spinner icon if you prefer */}
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </div>
    </div>
);

const NoProposalsComponent = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500 text-center">
            <p className="text-lg">No approved proposals to display.</p>
        </div>
    </div>
);


const Calendar: React.FC = () => {
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Proposal | null>(null);


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
                    status: data.proposalStatus || 'Pending',  // Default to 'Pending'
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
            }).filter(proposal => proposal.status === 'Approved'); // Only approved proposals
            setEventProposals(proposalsList);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);


    const calendarEvents: EventInput[] = useMemo(() => {
        return eventProposals.map(proposal => {
            // Determine the background color based on tags
            let backgroundColor = '#3b82f6'; // Muted Blue (Accent)
            if (proposal.tags?.includes('Done')) backgroundColor = '#22c55e'; // Green
            if (proposal.tags?.includes('Review')) backgroundColor = '#eab308'; // Yellow
            if (proposal.tags?.includes('Rejected')) backgroundColor = '#ef4444';  // Should not happen

            return {
                id: proposal.id,
                title: proposal.title,
                start: proposal.date,
                allDay: true,
                extendedProps: proposal, // Store the entire proposal object
                backgroundColor: backgroundColor,
                borderColor: backgroundColor, // Use same color for border
                textColor: 'white', // Ensure text is readable
            };
        });
    }, [eventProposals]);

    const handleEventClick = (clickInfo: EventClickArg) => {
        setSelectedEvent(clickInfo.event.extendedProps as Proposal);
    };

    const closePopup = () => {
        setSelectedEvent(null);
    };

    // Simplified and more consistent badge styling
    const getBadgeClass = (tags?: string[]) => {
        if (!tags) return 'bg-blue-500 text-white';
        if (tags.includes('Done')) return 'bg-green-500 text-white';
        if (tags.includes('Review')) return 'bg-yellow-500 text-white';
        if (tags.includes('Rejected')) return 'bg-red-500 text-white';
        return 'bg-blue-500 text-white';
    };

    const getBadgeText = (tags?: string[]) => {
        return tags?.find(tag => ['Done', 'Review', 'Rejected'].includes(tag)) || 'Approved';
    };

    if (loading) {
        return <LoadingComponent />;
    }

    if (eventProposals.length === 0) {
        return <NoProposalsComponent />;
    }


    return (
        <div className="h-full w-full font-sans text-gray-900">
            <div className="">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    eventClassNames="cursor-pointer"
                    height="80vh"
                    themeSystem="standard"
                    titleFormat={{
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    }}
                />

            </div>

            {/* Modal/Popup */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-semibold text-gray-800">{selectedEvent.title}</h2>
                            <button onClick={closePopup} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label='close'>
                                <X size={28} />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3">
                            <p><span className="font-medium text-gray-700">Organizing Department:</span> {selectedEvent.organizer}</p>
                            <p><span className="font-medium text-gray-700">Convener:</span> {selectedEvent.convenerName}</p>
                            <p><span className="font-medium text-gray-700">Convener Email:</span> {selectedEvent.convenerEmail}</p>
                            <p><span className="font-medium text-gray-700">Date:</span> {new Date(selectedEvent.date).toLocaleDateString("en-GB")}</p>
                            <div>
                                <span className="font-medium text-gray-700">Status:</span> <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(selectedEvent.tags)}`}>{getBadgeText(selectedEvent.tags)}</span>
                            </div>
                            <p><span className="font-medium text-gray-700">Category:</span> {selectedEvent.category}</p>
                            <p><span className="font-medium text-gray-700">Estimated Cost:</span> ₹{selectedEvent.cost.toLocaleString()}</p>
                            {selectedEvent.chiefGuestName && (
                                <>
                                    <p><span className="font-medium text-gray-700">Chief Guest:</span> {selectedEvent.chiefGuestName}</p>
                                    <p><span className="font-medium text-gray-700">Chief Guest Designation:</span> {selectedEvent.chiefGuestDesignation}</p>
                                </>
                            )}
                            <p className="text-gray-700 mt-4"><span className="font-semibold">Description:</span></p>
                            <p className="text-gray-700">{selectedEvent.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;