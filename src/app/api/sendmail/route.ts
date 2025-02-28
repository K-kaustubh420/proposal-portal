import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
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
  status: 'Approved' | 'Pending' | 'Rejected';
  sponsorshipType?: string;
  associatingAgencies?: string[] | string;
}

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter configuration failed:', error);
  } else {
    console.log('Transporter is ready:', success);
  }
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { proposal, action } = body;

    // Validate required fields
    if (!proposal || !action) {
      return NextResponse.json({ error: 'Proposal data and action are required' }, { status: 400 });
    }

    const requiredFields = ['id', 'title', 'organizer', 'date', 'category', 'cost', 'email', 'description', 'status'];
    const missingFields = requiredFields.filter(field => !proposal.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Validate status
    if (!['Approved', 'Pending', 'Rejected'].includes(proposal.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Prepare email content based on action and status
    let subject, emailBody;
    if (action === 'submit') {
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
      subject = `Proposal Update: ${proposal.title} (${proposal.status})`;
      emailBody = `
        <h1>Proposal Status Update</h1>
        <p><strong>Title:</strong> ${proposal.title}</p>
        <p><strong>Organizer:</strong> ${proposal.organizer}</p>
        <p><strong>Status:</strong> ${proposal.status}</p>
        <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
        <p>Dear ${proposal.organizer},</p>
        <p>Your proposal has been ${proposal.status.toLowerCase()}.</p>
        ${proposal.status === 'Approved' ? '<p>Congratulations! Please proceed with the next steps.</p>' : ''}
        ${proposal.status === 'Rejected' ? '<p>We regret to inform you that your proposal was not accepted. Contact support for details.</p>' : ''}
        <p>Best regards,<br/>Proposal System Team</p>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Append optional fields if present
    emailBody += proposal.sponsorshipType ? `<p><strong>Sponsorship Type:</strong> ${proposal.sponsorshipType}</p>` : '';
    emailBody += proposal.associatingAgencies ? `<p><strong>Agencies:</strong> ${Array.isArray(proposal.associatingAgencies) ? proposal.associatingAgencies.join(', ') : String(proposal.associatingAgencies)}</p>` : '';

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: proposal.email,
      subject,
      html: emailBody,
    });

    return NextResponse.json({
      message: `${action === 'submit' ? 'Proposal submitted' : 'Proposal updated'} and email sent successfully`,
      proposal,
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Optional: GET endpoint for manual testing
export async function GET() {
  try {
    return NextResponse.json({ message: 'Status check endpoint active' }, { status: 200 });
  } catch (error) {
    console.error('Error in status check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}