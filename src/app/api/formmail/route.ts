import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Transporter configuration failed:', error);
    } else {
        console.log('Transporter is ready:', success);
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Received request body:", body);

        const { subject, message, recipientEmail } = body; // Get email details

        if (!subject || !message || !recipientEmail) {
            console.log("Error: Missing email fields");
            return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail, // Send to provided email
            subject,
            html: `<p>${message}</p>`,
        };

        console.log("Sending email with options:", mailOptions);

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

        return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (err: unknown) {
        console.error('Error sending email:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}
    