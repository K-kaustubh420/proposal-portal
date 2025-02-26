'use client'
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const eventProposals = [
    { id: 1, title: 'AI Workshop', organizer: 'cherry plus', location: 'Auditorium', date: '2025-03-10', status: 'Approved' },
    { id: 2, title: 'Cyber Security Seminar', organizer: 'ctech and cypherclub', location: 'Room 302', date: '2025-04-15', status: 'Pending' },
    { id: 3, title: 'Hackathon 2025', organizer: 'liftoff', location: 'Main Hall', date: '2025-05-20', status: 'Rejected' },
];

const doughnutData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
        data: [5, 3, 2],
        backgroundColor: ['#34C759', '#FFC107', '#F44336'],
        borderWidth: 1,
    }],
};

const barData = {
    labels: ['Technical', 'Cultural', 'Academic', 'Sports'],
    datasets: [{
        label: 'Proposals',
        data: [10, 7, 5, 3],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
    }],
};

const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
        label: 'Proposals Submitted',
        data: [3, 7, 4, 6, 8],
        borderColor: '#6366F1',
        fill: true,
    }],
};

export default function EventPortal() {
    return (
        <div style={{ backgroundImage: "url('/tp.jpg')" }}>
        <div className="p-4 card bg-slate-500 bg-opacity-90 space-y-6 max-w-6xl mx-auto">
            <h1 className="text-4xl text-gray-950 font-bold text-left mb-8">Event Proposal Dashboard</h1>
            
            {/* Proposal Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventProposals.map((event) => (
                    <div key={event.id} className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
                        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                        <p className="text-sm text-gray-600">By: {event.organizer}</p>
                        <p className="text-sm text-gray-600">Location: {event.location}</p>
                        <p className="text-sm text-gray-600">Date: {event.date}</p>
                        <div className={`badge ${event.status === 'Approved' ? 'badge-success' : event.status === 'Pending' ? 'badge-warning' : 'badge-error'} mt-2`}>{event.status}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-2">Approval Breakdown</h2>
                    <div className="w-32 md:w-48">
                        <Doughnut data={doughnutData} options={{
                            cutout: '70%',
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return `${context.dataset.label}: ${context.formattedValue}`;
                                        },
                                    },
                                },
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                },
                            },
                        }} />
                    </div>
                </div>
                
                <div className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-2">Proposal Categories</h2>
                    <div className="w-48 md:w-64">
                        <Bar data={barData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return `${context.dataset.label}: ${context.formattedValue}`;
                                        },
                                    },
                                },
                                legend: {
                                    display: true,
                                    position: 'top',
                                },
                            },
                        }} />
                    </div>
                </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2">Submission Trends</h2>
                <div className="w-full md:w-3/4">
                    <Line data={lineData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.dataset.label}: ${context.formattedValue}`;
                                    },
                                },
                            },
                            legend: {
                                display: true,
                                position: 'top',
                            },
                        },
                    }} />
                </div>
            </div>
        </div>
        </div>
    );
}
