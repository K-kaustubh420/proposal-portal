// components/PopupCard.tsx
"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PopupCardProps {
    proposal: {
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
    };
    onClose: () => void;
    onUpdateStatus: (newStatus: string, clarificationMessage?: string) => void;
    isUpdatingStatus: boolean;
    statusUpdateMessage: string | null;
    showReject: boolean;
    showRequestInfo: boolean;
}

const PopupCard: React.FC<PopupCardProps> = ({
    proposal,
    onClose,
    onUpdateStatus,
    isUpdatingStatus,
    statusUpdateMessage,
    showReject = false,
    showRequestInfo = false,
}) => {
    const [rejectionMessage, setRejectionMessage] = useState(''); // Message for rejection only

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-semibold text-gray-800">{proposal.title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="close">
                        <X size={28} />
                    </button>
                </div>
                <div className="mt-4 space-y-3 overflow-y-auto max-h-[60vh]">
                    {/* Comprehensive Event Details */}

                     <p><span className="font-medium text-gray-700">Title:</span> {proposal.title}</p>
                    <p><span className="font-medium text-gray-700">Organizing Department:</span> {proposal.organizer}</p>
                    <p><span className="font-medium text-gray-700">Convener:</span> {proposal.convenerName}</p>
                    <p><span className="font-medium text-gray-700">Convener Email:</span> {proposal.convenerEmail}</p>
                    <p><span className="font-medium text-gray-700">Event Date:</span> {new Date(proposal.date).toLocaleDateString("en-GB")}</p>
                    <p><span className="font-medium text-gray-700">Status:</span> {proposal.status}</p>
                    <p><span className="font-medium text-gray-700">Category:</span> {proposal.category}</p>
                    <p><span className="font-medium text-gray-700">Estimated Cost:</span> ₹{proposal.cost.toLocaleString()}</p>
                    {proposal.location && (
                        <p><span className="font-medium text-gray-700">Location:</span> {proposal.location}</p>
                    )}
                    {proposal.chiefGuestName && (
                        <>
                            <p><span className="font-medium text-gray-700">Chief Guest:</span> {proposal.chiefGuestName}</p>
                            <p><span className="font-medium text-gray-700">Chief Guest Designation:</span> {proposal.chiefGuestDesignation}</p>
                        </>
                    )}
                    {proposal.events && proposal.events.length > 0 && (
                        <div>
                            <p className="font-medium text-gray-700">Sub-Events:</p>
                            <ul className="list-disc list-inside">
                                {proposal.events.map((event, index) => (
                                    <li key={index}>{event.eventTitle}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {proposal.tags && proposal.tags.length > 0 && (
                        <p><span className="font-medium text-gray-700">Tags:</span> {proposal.tags.join(', ')}</p>
                    )}
                    {proposal.clarificationMessage && (
                        <p>
                            <span className="font-medium text-gray-700">Previous Clarification Request:</span>
                            <span className="text-gray-600">{proposal.clarificationMessage}</span>
                        </p>
                    )}
                    <p className="text-gray-700 mt-4"><span className="font-semibold">Description:</span></p>
                    <p className="text-gray-700">{proposal.description}</p>

                    {/* Rejection Message Input (Only for Reject) */}
                    {showReject && (
                        <div className="mt-4">
                            <label htmlFor="rejectionMessage" className="block text-sm font-medium text-gray-700">
                                Reason for Rejection:
                            </label>
                            <textarea
                                id="rejectionMessage"
                                value={rejectionMessage}
                                onChange={(e) => setRejectionMessage(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Button Actions */}
                    <div className="flex justify-end space-x-4 mt-6">
                        {/* Approve Button */}
                       {/* Approve Button */}
                       <button
                              onClick={() => onUpdateStatus('Approved')} // Changed to 'Approved'
                              className="btn btn-success text-white"
                               disabled={isUpdatingStatus}
                                >
                                  Approve
                        </button>

                        {/* Request Info Button */}
                        {showRequestInfo && (
                            <button
                                onClick={() => {
                                    const message = prompt('Enter clarification request:');
                                    console.log("PopupCard - Request Info Prompt Message:", message); // ADDED CONSOLE LOG
                                    if (message) {
                                        onUpdateStatus('Request Info', message);
                                    }
                                }}
                                className="btn btn-info text-white"
                                disabled={isUpdatingStatus}
                            >
                                Request Info
                            </button>
                        )}

                        {/* Reject Button */}
                        {showReject && (
                            <button
                                onClick={() => {
                                    if (rejectionMessage.trim()) {
                                        onUpdateStatus('Rejected', rejectionMessage);
                                    } else {
                                        alert('Please provide a reason for rejection.');
                                    }
                                }}
                                className="btn btn-error text-white"
                                disabled={isUpdatingStatus || !rejectionMessage.trim()}
                            >
                                Reject
                            </button>
                        )}
                    </div>

                    {statusUpdateMessage && (
                        <div className={`mt-4 p-3 rounded-md ${statusUpdateMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {statusUpdateMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupCard;