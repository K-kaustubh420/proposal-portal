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
    };
    onClose: () => void;
    onUpdateStatus: (newStatus: string, newTag?: string, feedback?: string) => void;
    isUpdatingStatus: boolean;
    statusUpdateMessage: string | null;
}

const PopupCard: React.FC<PopupCardProps> = ({
    proposal,
    onClose,
    onUpdateStatus,
    isUpdatingStatus,
    statusUpdateMessage
}) => {
    const [feedback, setFeedback] = useState('');
    const [showFeedbackInput, setShowFeedbackInput] = useState<'review' | 'reject' | null>(null);

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

    const handleUpdate = (newStatus: string, newTag?: string) => {
        if (showFeedbackInput) {
             if (!feedback.trim()) {
                alert('Please provide feedback before submitting.');
                return;
            }
            onUpdateStatus(newStatus, newTag, feedback);

        }
        else{
              onUpdateStatus(newStatus, newTag);
        }

    };

    const handleSendFeedback = () => {
        if (showFeedbackInput === 'review') {
            handleUpdate(proposal.status, 'Review'); // Keep existing status, add 'Review' tag
        } else if (showFeedbackInput === 'reject') {
            handleUpdate('Rejected', 'Rejected'); // Set status to 'Rejected', add 'Rejected' tag
        }
        // The handleUpdate function *now* correctly handles sending feedback
    };


    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-semibold text-gray-800">{proposal.title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <X size={28} />
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    <p><span className="font-medium text-gray-700">Organizing Department:</span> {proposal.organizer}</p>
                    <p><span className="font-medium text-gray-700">Convener:</span> {proposal.convenerName}</p>
                    <p><span className="font-medium text-gray-700">Convener Email:</span> {proposal.convenerEmail}</p>
                    <p><span className="font-medium text-gray-700">Date:</span> {new Date(proposal.date).toLocaleDateString("en-GB")}</p>
                    <div>
                        <span className="font-medium text-gray-700">Status:</span> <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(proposal.tags)}`}>{getBadgeText(proposal.tags)}</span>
                    </div>
                    <p><span className="font-medium text-gray-700">Category:</span> {proposal.category}</p>
                    <p><span className="font-medium text-gray-700">Estimated Cost:</span> ₹{proposal.cost.toLocaleString()}</p>
                    {proposal.chiefGuestName && (
                        <>
                            <p><span className="font-medium text-gray-700">Chief Guest:</span> {proposal.chiefGuestName}</p>
                            <p><span className="font-medium text-gray-700">Chief Guest Designation:</span> {proposal.chiefGuestDesignation}</p>
                        </>
                    )}
                    <p className="text-gray-700 mt-4"><span className="font-semibold">Description:</span></p>
                    <p className="text-gray-700">{proposal.description}</p>

                    {/* Feedback Input */}
                    {showFeedbackInput && (
                        <div className="mt-4">
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                                {showFeedbackInput === 'review' ? 'Reason for Review:' : 'Reason for Rejection:'}
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={3}
                            />
                             <button
                                onClick={handleSendFeedback}
                                className="mt-2 btn btn-primary text-white"
                                disabled={isUpdatingStatus}

                            >
                                Send Feedback
                            </button>
                        </div>
                    )}

                    {/* Button Actions */}
                    <div className="flex justify-end space-x-4 mt-6">

                        <button
                            onClick={() => onUpdateStatus('Approved', 'Done')}
                            className="btn btn-success text-white"
                            disabled={isUpdatingStatus || proposal.tags?.includes('Done')}
                        >
                            Approve & Forward
                        </button>

                        <button
                           onClick={() => setShowFeedbackInput('review')}
                            className="btn btn-info text-white"
                            disabled={isUpdatingStatus || proposal.tags?.includes('Review')}
                        >
                            Mark for Review
                        </button>

                        <button
                            onClick={() => {
                                setShowFeedbackInput('review');
                            }}

                            className="btn btn-primary text-white"
                            disabled={isUpdatingStatus || proposal.tags?.includes('Review') || proposal.tags?.includes('Done')}
                        >
                            Mark for Review & Send Back
                        </button>


                        <button
                            onClick={() => setShowFeedbackInput('reject')}
                            className="btn btn-error text-white"
                            disabled={isUpdatingStatus || proposal.tags?.includes('Rejected')}
                        >
                            Reject & Send Back
                        </button>
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