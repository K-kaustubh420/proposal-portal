// route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Define the Proposal interface
interface Proposal {
    id: string;
    title: string;
    organizer: string;
    date: string;
    category: string;
    cost: number;
    email: string;
    description: string;
    status: 'Approved' | 'Pending' | 'Rejected' | 'Review'; // Add 'Review' status
    sponsorshipType?: string;
    associatingAgencies?: string[] | string;
}

// Initialize Nodemailer transporter (Keep your existing transporter setup)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify transporter configuration on startup (Keep your existing verification)
transporter.verify((err: any, success: any) => {
    if (err) {
        console.error('Transporter configuration failed:', err);
    } else {
        console.log('Transporter is ready:', success);
    }
});

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        console.log("Received request body:", body); // ADDED LOGGING: Log the request body
        const { proposal, action } = body;

        // Validate required fields (Keep your existing validation)
        if (!proposal || !action) {
            console.log("Error: Proposal data and action are required"); // ADDED LOGGING
            return NextResponse.json({ error: 'Proposal data and action are required' }, { status: 400 });
        }

        const requiredFields = ['id', 'title', 'organizer', 'date', 'category', 'cost', 'email', 'description', 'status'];
        const missingFields = requiredFields.filter(field => !proposal.hasOwnProperty(field));
        if (missingFields.length > 0) {
            console.log(`Error: Missing required fields: ${missingFields.join(', ')}`); // ADDED LOGGING
            return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        // Validate status (Include 'Review' in valid statuses)
        if (!['Approved', 'Pending', 'Rejected', 'Review'].includes(proposal.status)) { // Added 'Review'
            console.log(`Error: Invalid status: ${proposal.status}`); // ADDED LOGGING
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Prepare email content based on action and status
        let subject, emailBody;
        if (action === 'submit') {
            // ... (Your existing submit email logic - no changes needed here)
            subject = `Proposal Submission Confirmation: ${proposal.title}`;
            emailBody = `
                <h1>Proposal Submission Confirmation</h1>
                <p><strong>Title:</strong> ${proposal.title}</p>
                <p><strong>Organizer:</strong> ${proposal.organizer}</p>
                <p><strong>Status:</strong> ${proposal.status}</p>
                <p><strong>Submitted On:</strong> ${new Date().toLocaleString()}</p>
                <p>Dear ${proposal.organizer},</p>
                <p>Thank you for submitting your proposal. It is currently marked as <strong>${proposal.status}</strong> for review.</p>
                <p>We will notify you once a decision is made. For any queries, feel free to contact support.</p>
                <p>Best regards,<br/>Proposal System Team</p>
            `;
        } else if (action === 'update') {
            subject = `Proposal Update: ${proposal.title} - Status: ${proposal.status}`; // Updated subject to include status
            emailBody = `
                <h1>Proposal Status Update</h1>
                <p><strong>Title:</strong> ${proposal.title}</p>
                <p><strong>Organizer:</strong> ${proposal.organizer}</p>
                <p><strong>Status:</strong> ${proposal.status}</p>
                <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
                <p>Dear ${proposal.organizer},</p>
                <p>Your proposal status has been updated to <strong>${proposal.status}</strong>.</p>
                ${proposal.status === 'Approved' ? '<p>Congratulations! Your proposal has been approved. Please proceed with the next steps.</p>' : ''}
                ${proposal.status === 'Rejected' ? '<p>We regret to inform you that your proposal was not accepted. Please contact support for more details.</p>' : ''}
                ${proposal.status === 'Review' ? '<p>Your proposal is currently under review. We will notify you of the decision soon.</p>' : ''}
                <p>Best regards,<br/>Proposal System Team</p>
            `;
        } else {
            console.log(`Error: Invalid action: ${action}`); // ADDED LOGGING
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Append optional fields if present (Keep your existing optional field logic)
        emailBody += proposal.sponsorshipType ? `<p><strong>Sponsorship Type:</strong> ${proposal.sponsorshipType}</p>` : '';
        emailBody += proposal.associatingAgencies ? `<p><strong>Agencies:</strong> ${Array.isArray(proposal.associatingAgencies) ? proposal.associatingAgencies.join(', ') : String(proposal.associatingAgencies)}</p>` : '';

        const mailOptions = { // ADDED: Log mailOptions before sending
            from: process.env.EMAIL_USER,
            to: proposal.email,
            subject,
            html: emailBody,
        };
        console.log("Mail Options:", mailOptions); // ADDED LOGGING: Log mailOptions

        // Send the email (Keep your existing sendMail logic)
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully"); // ADDED LOGGING

        return NextResponse.json({
            message: `${action === 'submit' ? 'Proposal submitted' : 'Proposal updated'} and email sent successfully`,
            proposal,
        }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error); // Existing error log
        console.error('Detailed error:', error); // ADDED LOGGING: Log the full error object
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 }); // Include error details in response
    }
}