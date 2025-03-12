"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '@/firebase/config';
import { collection, getDocs, DocumentData, doc, updateDoc, getDoc } from 'firebase/firestore';
import listPlugin from '@fullcalendar/list';
import { EventInput, EventClickArg } from '@fullcalendar/core'; // Import EventClickArg
import PopupCard from './PopupCard'; // Import the new PopupCard


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

const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500 animate-spin">
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
    console.log("Calendar Rendering");
    const [eventProposals, setEventProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Proposal | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

    const fetchProposals = useCallback(async () => {
        console.log("fetchProposals CALLED in Calendar"); // Add this
        setLoading(true);
        try {
            const proposalsCollection = collection(db, 'eventProposals');
            const proposalSnapshot = await getDocs(proposalsCollection);
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
                };
                console.log("Fetched proposal in Calendar:", proposal); // Log fetched data
                return proposal;

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
            let backgroundColor = '#3b82f6';
            if (proposal.tags?.includes('Done')) backgroundColor = '#22c55e';
            if (proposal.tags?.includes('Review')) backgroundColor = '#eab308';
            if (proposal.tags?.includes('Rejected')) backgroundColor = '#ef4444';

            return {
                id: proposal.id,
                title: proposal.title,
                start: proposal.date,
                allDay: true,
                extendedProps: proposal,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: 'white',
            };
        });
    }, [eventProposals]);

    const handleEventClick = (clickInfo: EventClickArg) => {
        setSelectedEvent(clickInfo.event.extendedProps as Proposal);
    };

    const closePopup = () => {
        setSelectedEvent(null);
         setStatusUpdateMessage(null);
    };


    const updateProposalStatus = useCallback(async (newStatus: string, newTag?: string, feedback?: string) => {
        if (!selectedEvent) return;
        if (isUpdatingStatus) return;

        setIsUpdatingStatus(true);
        setStatusUpdateMessage('Updating status...');

        try {
            setEventProposals(currentProposals =>
                currentProposals.map(proposal => {
                    if (proposal.id === selectedEvent.id) {
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
                       proposal.status = newStatus; // Correct state update
                       proposal.tags = updatedTags;  // Correct state update
                       return proposal;

                    }
                    return proposal;
                })
            );


            const proposalDocRef = doc(db, 'eventProposals', selectedEvent.id);
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
            const updatedProposal = { ...selectedEvent, status: newStatus, tags: updateData.tags || [] };

             const emailData = {
                proposal: updatedProposal,
                action: 'update',
                feedback: feedback,
            };

            console.log("Data sent to API from Calendar:", emailData); // Log before API call

            const response = await fetch('/api/sendmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
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
            fetchProposals(); // Refresh data after error

        } finally {
            setIsUpdatingStatus(false);
             closePopup();
            setTimeout(() => setStatusUpdateMessage(null), 5000); // Clear message after 5 seconds
        }
    }, [selectedEvent, isUpdatingStatus, fetchProposals]);


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

            {selectedEvent && (
                <PopupCard
                    proposal={selectedEvent}
                    onClose={closePopup}
                    onUpdateStatus={updateProposalStatus}
                    isUpdatingStatus={isUpdatingStatus}
                    statusUpdateMessage={statusUpdateMessage}
                />
            )}
        </div>
    );
};

export default Calendar;