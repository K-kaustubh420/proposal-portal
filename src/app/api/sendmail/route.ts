// api/sendmail.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err: Error | null, success: boolean) => {
    if (err) {
        console.error('Transporter configuration failed:', err);
    } else {
        console.log('Transporter is ready:', success);
    }
});

// Email mapping for the hierarchy
const hodEmailDepartmentMap: Record<string, string> = {
    "Ctech": "kn3959@srmist.edu.in",  // Replace with actual HOD emails
    "Cintel": "kn3959@srmist.edu.in",
    "Aerospace Engineering": "neupanekiran512@gmail.com",
    "Automobile Engineering": "neupanekiran450@gmail.com",
    "Biomedical Engineering":"namasteportraits@gmailcom",
    "Biotechnology":"rn8638@srmist.edu.in",
};

const associateChairEmailMap: Record<string, string> = {

    "Aerospace Engineering": "neupanekiran512@gmail.com",
    "Automobile Engineering":"neupanekiran512@gmail.com",
    "Ctech":"kn3959@srmist.edu.in",
    "Biotechnology":"rn8638@srmist.edu.in",

};

const chairEmailMap: Record<string, string> = {
    "Ctech": "chair1@example.com",        // Replace with actual Chair emails
    "Cintel": "chair1@example.com",
    "Department3": "chair1@example.com",
    "Department4": "chair1@example.com",
    "Aerospace Engineering": "neupanekiran512@gmail.com",
    "Automobile Engineering":"neupanekiran512@gmail.com",
    "Biomedical Engineering":"namasteportraits@gmailcom",
    "Biotechnology":"kk6682@srmist.edu.in",
    // ... add mappings for the Chair
};

const deanEmail = "dean.engineering@srmist.edu.in"; // Replace with the Dean's email


export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Received request body:", body);
        const { proposal, action, recipientRole, message } = body;

        if (!proposal || !action) {
            console.log("Error: Proposal data and action are required");
            return NextResponse.json({ error: 'Proposal data and action are required' }, { status: 400 });
        }
        //Required fields check
        const requiredFields = ['id', 'title', 'organizingDepartment', 'date', 'category', 'cost', 'convenerEmail', 'description', 'status', 'eventTitle', 'convenerName'];
        const missingFields = requiredFields.filter(field => !proposal.hasOwnProperty(field));
        if (missingFields.length > 0) {
            console.log(`Error: Missing required fields: ${missingFields.join(', ')}`);
            return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }
        //Status validation
        if (!['ApprovedByHOD', 'ApprovedByAssociateChair', 'ApprovedByChair','Approved','Pending', 'Rejected', 'Review','AwaitingHODClarification','AwaitingAssociateChairClarification'].includes(proposal.status)) {
            console.log(`Error: Invalid status: ${proposal.status}`);
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Validate status-specific fields
        if (proposal.status === 'Rejected' && !proposal.rejectionMessage) {
            console.log("Error: Rejection message is required for Rejected status");
            return NextResponse.json({ error: 'Rejection message is required for Rejected status' }, { status: 400 });
        }
        if (proposal.status === 'Review' && !proposal.reviewMessage) {
            console.log("Error: Review message is required for Review status");
            return NextResponse.json({ error: 'Review message is required for Review status' }, { status: 400 });
        }
        if (proposal.status === 'AwaitingHODClarification' && !proposal.clarificationMessage) {
            console.log("Error: clarification message is required for AwaitingHODClarification status");
            return NextResponse.json({ error: 'clarification message is required for AwaitingHODClarification status' }, { status: 400 });
        }
        if (proposal.status === 'AwaitingAssociateChairClarification' && !proposal.clarificationMessage) {
            console.log("Error: clarification message is required for AwaitingAssociateChairClarification status");
            return NextResponse.json({ error: 'clarification message is required for AwaitingAssociateChairClarification status' }, { status: 400 });
        }

        console.log(`Processing action: ${action}, status: ${proposal.status}`);

        let subject: string = ''; // Initialize with empty string
        let emailBody: string = ''; // Initialize with empty string
        let recipientEmail: string | undefined;

        if (action === 'submit') {
            // Convener submits -> HOD
            subject = `New Proposal Submission: ${proposal.title}`;
            emailBody = `
            <h1>New Proposal Submission</h1>
            <p><strong>Title:</strong> ${proposal.eventTitle}</p>
            <p><strong>Organizing Department:</strong> ${proposal.organizingDepartment}</p>
            <p><strong>Status:</strong> ${proposal.status}</p>
            <p><strong>Submitted On:</strong> ${new Date().toLocaleString()}</p>
            <p>Dear HOD,</p>
            <p>A new proposal "${proposal.title}" has been submitted by ${proposal.convenerName} (${proposal.convenerEmail}).</p>
            <p>Please review the proposal at your convenience.</p>
            <p>Best regards,<br/>Proposal System Team</p>
        `;
            recipientEmail = hodEmailDepartmentMap[proposal.organizingDepartment];

            if (!recipientEmail) {
                console.error(`Error: No HOD email found for department: ${proposal.organizingDepartment}`);
                return NextResponse.json({ error: `No HOD email found for department: ${proposal.organizingDepartment}` }, { status: 400 }); // Or 500, depending on how you want to handle it
            }

        }
        else if (action === 'update') {
            subject = `Proposal Update: ${proposal.title} - Status: ${proposal.status}`;
            // Construct the common part of the email body.
            emailBody = `
                <h1>Proposal Status Update</h1>
                <p><strong>Title:</strong> ${proposal.title}</p>
                <p><strong>Organizing Department:</strong> ${proposal.organizingDepartment}</p>
                <p><strong>Status:</strong> ${proposal.status}</p>
                <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
                <p>Dear ${recipientRole ==='Convener,HOD,AssociateChair'?'All': recipientRole},</p>
                <p>The proposal "${proposal.title}" status has been updated to <strong>${proposal.status}</strong>.</p>
            `;

            if (recipientRole === 'AssociateChair') {
                recipientEmail = associateChairEmailMap[proposal.organizingDepartment];
            } else if (recipientRole === 'Chair') {
                recipientEmail = chairEmailMap[proposal.organizingDepartment];
            } else if (recipientRole === 'Dean') {
                recipientEmail = deanEmail;
            } else if (recipientRole === 'Convener') {
                recipientEmail = proposal.convenerEmail;
            }else if (recipientRole === 'HOD') {
                recipientEmail = hodEmailDepartmentMap[proposal.organizingDepartment]; //for clarification
            }
            // Handle combined roles (Convener, AssociateChair, HOD):
            else if (recipientRole === 'Convener,AssociateChair') {
                recipientEmail = `${proposal.convenerEmail}, ${associateChairEmailMap[proposal.organizingDepartment]}`;

            }
            else if (recipientRole === 'Convener,HOD,AssociateChair'){
                recipientEmail = `${proposal.convenerEmail}, ${associateChairEmailMap[proposal.organizingDepartment]}, ${hodEmailDepartmentMap[proposal.organizingDepartment]}`;
            }

            if (!recipientEmail) {
                console.error(`Error: No email found for role: ${recipientRole}, department: ${proposal.organizingDepartment}`);
                return NextResponse.json({ error: `No email found for role: ${recipientRole}, department: ${proposal.organizingDepartment}` }, { status: 400 });
            }
            if (proposal.status === 'ApprovedByHOD') {
                emailBody += `<p>The HOD has approved the proposal. It is now awaiting review by the Associate Chair.</p>`;

            }
            else if(proposal.status === 'ApprovedByAssociateChair'){
                emailBody += `<p>The Associate Chair has approved the proposal. It is now awaiting review by the  Chair.</p>`;

            }

            else if (proposal.status === 'Approved') {
                emailBody += `<p>The Chair has approved the proposal. It is now forwarded to the Dean.</p>`;
            }
            else if (proposal.status === 'Review') {
                emailBody += `<p><strong>Review Comments:</strong> ${message}</p><p>Please review the comments and resubmit the proposal.</p>`;
            }
            else if (proposal.status === 'Approved') { // Handle 'Approved' status for convener email
                emailBody = `
                    <h1>Congratulations! Your Proposal has been Approved</h1>
                    <p><strong>Title:</strong> ${proposal.eventTitle}</p>
                    <p><strong>Organizing Department:</strong> ${proposal.organizingDepartment}</p>
                    <p><strong>Status:</strong> ${proposal.status} - Approved</p> <p>Dear Convener,</p><p>We are pleased to inform you that your proposal "${proposal.title}" has been <strong>approved</strong>.</p> <p>Best regards,<br/>Proposal System Team</p>`;
            }
            else if (proposal.status === 'AwaitingHODClarification') {
                emailBody += `<p><strong>Clarification Requested:</strong> ${message}</p><p>Please provide the requested clarification.</p>`;
            }
            else if (proposal.status === 'AwaitingAssociateChairClarification') {
                emailBody += `<p><strong>Clarification Requested:</strong> ${message}</p><p>Please provide the requested clarification.</p>`;

            }
            else if (proposal.status === 'Rejected') {
                emailBody += `<p><strong>Reason for Rejection:</strong> ${message}</p><p>The proposal has been rejected.</p>`;
            }

            emailBody += `<p>Best regards,<br/>Proposal System Team</p>`;
        }


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,  // This is now dynamically set
            subject,
            html: emailBody,
        };

        console.log("Mail Options:", mailOptions);

        await transporter.sendMail(mailOptions); //  Send Email
        console.log("Email sent successfully");

        return NextResponse.json({
            message: `Proposal ${action === 'submit' ? 'submitted' : 'updated'} and email sent successfully`,
            proposal, // Good practice to return the updated proposal
        }, { status: 200 });

    } catch (error) {
        console.error('Error processing request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
} 