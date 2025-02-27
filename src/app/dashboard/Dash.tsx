"use client";
import React from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import { ListChecks, ThumbsUp, Clock, Calendar, Layers, Flag, TrendingUp, FileText, UserRound, XCircle, CheckCircle, ArrowUpRight, Info } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler);

// Enhanced Demo Data - Event Proposals (Data remains same)
const eventProposals = [
    { id: 1, title: 'Coding Workshop for Beginners', organizer: 'ACM Club', date: '2024-03-10', status: 'Approved', category: 'Technical', cost: 1200, email: 'acm@example.org' },
    { id: 2, title: 'Spring Dance Fest', organizer: 'Music and Dance Club', date: '2024-04-15', status: 'Approved', category: 'Cultural', cost: 1500, email: 'danceclub@example.org' },
    { id: 3, title: 'Astro Photography Night', organizer: 'Astrophilia Society', date: '2024-05-20', status: 'Approved', category: 'Academic', cost: 900, email: 'astro.society@example.org' },
    { id: 4, title: 'Web Design Seminar', organizer: 'Cherry Network', date: '2024-06-05', status: 'Approved', category: 'Technical', cost: 1100, email: 'cherry.network@example.org' },
    { id: 5, title: 'Cricket Tournament', organizer: 'Sports Club', date: '2024-07-01', status: 'Approved', category: 'Sports', cost: 2000, email: 'sports.club@example.org' },
    { id: 6, title: 'Literary Arts Workshop', organizer: 'Milan - Literary Club', date: '2024-08-12', status: 'Pending', category: 'Cultural', cost: 700, email: 'milan.club@example.org' },
    { id: 7, title: 'Robotics Challenge', organizer: 'Lift-off Club', date: '2024-09-25', status: 'Approved', category: 'Technical', cost: 1800, email: 'liftoff.club.org' },
    { id: 8, title: 'Business Plan Competition', organizer: 'ECell', date: '2024-10-18', status: 'Rejected', category: 'Academic', cost: 2500, email: 'ecell@example.org' },
    { id: 9, title: 'Photography Exhibition', organizer: 'Aarush - Photography Club', date: '2024-11-07', status: 'Pending', category: 'Cultural', cost: 650, email: 'aarush.photo@example.org' },
    { id: 10, title: 'Advanced ML Conference', organizer: 'Tech Society', date: '2024-12-02', status: 'Approved', category: 'Technical', cost: 2300, email: 'tech.society@example.org' },
    { id: 11, title: 'Debate Championship', organizer: 'Debate Club', date: '2025-01-15', status: 'Approved', category: 'Academic', cost: 1100, email: 'debate.society@example.org' },
    { id: 12, title: 'Gaming Tournament', organizer: 'Gaming Guild', date: '2025-02-28', status: 'Pending', category: 'Sports', cost: 1600, email: 'gaming.guild@example.org' },
    { id: 13, title: 'Music Mania Concert', organizer: 'Music Club', date: '2025-03-15', status: 'Approved', category: 'Cultural', cost: 2200, email: 'music.club@example.org' },
    { id: 14, title: 'Advanced Robotics Workshop', organizer: 'Lift-off Club', date: '2025-04-22', status: 'Pending', category: 'Technical', cost: 1400, email: 'liftoff.club.adv@example.org' },
];

const approvedProposals = eventProposals.filter(p => p.status === 'Approved').length;
const pendingProposals = eventProposals.filter(p => p.status === 'Pending').length;
const rejectedProposals = eventProposals.filter(p => p.status === 'Rejected').length;
const totalProposals = eventProposals.length;
const totalCost = eventProposals.reduce((sum, p) => sum + p.cost, 0);

const pieData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
        label: 'Proposal Status',
        data: [approvedProposals, pendingProposals, rejectedProposals],
        backgroundColor: ['#A78BFA', '#F9A8D4', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 5
    }],
};


const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#2D3748',
            bodyColor: '#fff',
            titleColor: '#fff',
            borderColor: '#6B7280',
            borderWidth: 1,
            intersect: false,
            mode: 'index',
            bodyFont: { size: 14 },
            titleFont: { size: 16, weight: 'bold' },
            padding: 10,
            callbacks: {
                label: (context) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
        chartArea: {
            backgroundColor: '#1E293B'
        },
    },
    scales: {
        y: {
            type: 'linear',
            beginAtZero: true,
            grid: {
                borderColor: '#6B7280',
                borderDash: [3, 3],
                color: '#6B7280',
                lineWidth: 1,
            },
            ticks: {
                color: '#fff',
                font: { size: 12 }
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#fff',
                font: { size: 12 }
            }
        }
    },
    elements: {
        line: {
            tension: 0.4,
        }
    }
};

//Mock data for line graph
const monthlySubmissionsData = [
    60,
    55,
    40,
    85,
    64,
    70,
    94,
    34,
    78,
    54,
    76,
    56
];


const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Monthly Submissions',
        data: monthlySubmissionsData,
        borderColor: '#3b82f6',
        borderWidth: 3,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 1,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        segment: {
            borderColor: '#3b82f6',
            borderWidth: 3,
        },
    }],
};


export default function EventPortal() {
    // Get Recent Proposals (Recent proposals data remains same)
    const recentApprovedProposals = eventProposals.filter(p => p.status === 'Approved').slice(-3).reverse();
    const recentAppliedProposals = eventProposals.filter(p => p.status === 'Pending').slice(-3).reverse();


    return (
        <>
         <div className="bg-slate-200 min-h-screen font-sans text-black">
            <div className="p-6 max-w-7xl mx-auto space-y-8">

                {/* Header and Title */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-400">Welcome</h1>
                        <p className="text-gray-400 text-sm">Here's a snapshot of event proposals in your institute</p>
                    </div>
                    <div>
                        <select className="select select-bordered select-sm max-w-xs bg-slate-200 text-slate-700">
                            <option disabled selected>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                        </select>
                    </div>
                </div>
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card shadow-md rounded-lg border-t-4 border-blue-500 bg-slate-200">
                        <div className="card-body flex flex-col items-start">
                            <ListChecks className="h-6 w-6 text-blue-500 mb-2" />
                            <div className="text-xl font-bold text-gray-700">{totalProposals.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Total Applied</div>
                        </div>
                    </div>

                    <div className="card shadow-md rounded-lg border-t-4 border-green-500 bg-slate-200">
                        <div className="card-body flex flex-col items-start">
                            <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                            <div className="text-xl font-bold text-gray-700">{approvedProposals.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Approved</div>
                        </div>
                    </div>

                    <div className="card shadow-md rounded-lg border-t-4 border-red-500 bg-slate-200">
                        <div className="card-body flex flex-col items-start">
                            <XCircle className="h-6 w-6 text-red-500 mb-2" />
                            <div className="text-xl font-bold text-gray-700">{rejectedProposals.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Rejected</div>
                        </div>
                    </div>


                    <div className="card shadow-md rounded-lg border-t-4 border-yellow-500 bg-slate-200">
                        <div className="card-body flex flex-col items-start">
                            <Clock className="h-6 w-6 text-yellow-500 mb-2" />
                            <div className="text-xl font-bold text-gray-700">{pendingProposals.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Pending</div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side - Submission Trends (Line Chart) and Recently Approved Proposals List */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Submission Trends Line Chart - NEW DESIGN APPLIED */}
                        <div className="max-w-full w-full rounded-lg shadow-md  p-5 md:p-7 bg-slate-200">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h5 className="leading-none text-3xl font-bold text-gray-700 pb-2">{totalProposals.toLocaleString()}</h5>
                                    <p className="text-base font-normal text-gray-700">Proposals this year</p>
                                </div>
                                <div
                                    className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-800 dark:text-green-500 text-center">
                                    +{(approvedProposals/totalProposals*100).toFixed(1)}%
                                    <ArrowUpRight className="w-3 h-3 ms-1" aria-hidden="true" color="white" />
                                </div>
                            </div>
                            <div className="h-72 relative">
                                <Line data={lineData} options={lineOptions} />
                            </div>
                            <div className="grid grid-cols-1 items-center border-gray-700 border-t  justify-between mt-6">
                                <div className="flex justify-between items-center pt-5">
                                    <button
                                        id="dropdownDefaultButton-line"
                                        data-dropdown-toggle="lastDaysdropdown-line"
                                        data-dropdown-placement="bottom"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-400 text-center inline-flex items-center"
                                        type="button">
                                        Last Year
                                        <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                        </svg>
                                    </button>
                                    <div id="lastDaysdropdown-line" className="z-10 hidden bg-slate-200 divide-y divide-gray-700 rounded-lg shadow-sm w-44 text-slate-900 ">
                                        <ul className="py-2 text-sm text-gray-200 dark:text-gray-200" aria-labelledby="dropdownDefaultButton-line">
                                            <li><a href="#" className="block px-4 py-2  hover:bg-gray-600 ">Last Month</a></li>
                                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-600  ">Last 3 Months</a></li>
                                            <li><a href="#" className="block px-4 py-2  hover:bg-gray-600 text-black">Last Year</a></li>
                                        </ul>
                                    </div>
                                    <a
                                        href="#"
                                        className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-500  hover:text-blue-500  hover:bg-slate-200 dark:hover:bg-slate-200 dark:focus:ring-gray-700 dark:border-gray-700 px-3 py-2">
                                        Submission Report
                                        <ArrowUpRight className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" color="white" />
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* Recently Approved Proposals List - Renamed and Updated */}
                        <div className="card shadow-md rounded-lg bg-slate-200">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="card-title text-lg font-bold text-gray-700">Recently Approved Proposals</h2>
                                    <a href="#" className="text-sm text-blue-500 hover:underline">See All Approved </a>
                                </div>
                                <div className="space-y-3">
                                    {recentApprovedProposals.map(proposal => (
                                        <div key={proposal.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="avatar mr-3">
                                                    <div className="mask mask-squircle w-8 h-8">
                                                        <img src={`/avatar${proposal.id % 3 + 1}.png`} alt="Avatar" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-600">{proposal.organizer}</div>
                                                    <div className="text-sm text-gray-400">{proposal.title}</div>
                                                </div>
                                            </div>
                                            <div className={`badge badge-sm badge-success`}>Approved</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Proposal Status (Pie Chart) and Recently Applied Proposals List */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Proposal Status Pie Chart - NEW DESIGN APPLIED */}
                        <div className="max-w-full w-full bg-slate-200 rounded-lg shadow-sm   p-4 md:p-6">

                            <div className="flex justify-between mb-3">
                                <div className="flex justify-center items-center">
                                    <h5 className="text-xl font-bold leading-none text-gray-700 pe-1">Proposal Status</h5>
                                    <button type="button" data-tooltip-target="data-tooltip-pie" data-tooltip-placement="bottom" className="hidden sm:inline-flex items-center justify-center text-gray-700 w-8 h-8  hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200  rounded-lg text-sm"><Info className="w-3.5 h-3.5" aria-hidden="true" color="black" /><span className="sr-only"></span>
                                    </button>
                                    <div id="data-tooltip-pie" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-slate-600 transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-slate-200">
                                        Status of event proposals submitted
                                        <div className="tooltip-arrow text-slate-700" data-popper-arrow></div>
                                    </div>
                                </div>
                                <div>
                                    <button type="button" data-tooltip-target="data-tooltip-download-pie" data-tooltip-placement="bottom" className="hidden sm:inline-flex items-center justify-center text-gray-700 w-8 h-8 dark:text-gray-400 hover:bg-gray-600 dark:hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm"><FileText className="w-3.5 h-3.5" aria-hidden="true" color="black" /><span className="sr-only">Download data</span>
                                    </button>
                                    <div id="data-tooltip-download-pie" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-slate-700 transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip ">
                                        Download CSV
                                        <div className="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                </div>
                            </div>


                            <div className="h-64 relative text-slate-800">
                                <Pie data={pieData} options={pieDataOptions} />
                            </div>


                            <div className="grid grid-cols-1 items-center border-gray-700 border-t dark:border-gray-700 justify-between mt-6">
                                <div className="flex justify-between items-center pt-5">
                                    <button
                                        id="dropdownDefaultButton-pie"
                                        data-dropdown-toggle="lastDaysdropdown-pie"
                                        data-dropdown-placement="bottom"
                                        className="text-sm font-medium text-gray-400 dark:text-gray-400 hover:text-white text-center inline-flex items-center "
                                        type="button">
                                        Last Year
                                        <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                        </svg>
                                    </button>
                                    <div id="lastDaysdropdown-pie" className="z-10 hidden bg-slate-200 divide-y divide-gray-700 rounded-lg shadow-sm w-44 dark:bg-slate-200">
                                        <ul className="py-2 text-sm text-gray-200 dark:text-gray-200" aria-labelledby="dropdownDefaultButton-pie">
                                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-600 dark:hover:text-white">Last Month</a></li>
                                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 3 Months</a></li>
                                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last Year</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Recently Applied Proposals List - MOVED HERE from below Line Chart (List card updated for dark theme) */}
                        <div className="card shadow-md rounded-lg bg-slate-200">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="card-title text-lg font-bold text-gray-700">Recently Applied Proposals</h2>
                                    <a href="#" className="text-sm text-blue-500 hover:underline">See All Applied </a>
                                </div>
                                <div className="space-y-3">
                                    {recentAppliedProposals.map(proposal => (
                                        <div key={proposal.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="avatar mr-3">
                                                    <div className="mask mask-squircle w-8 h-8">
                                                        <img src={`/avatar${(proposal.id + 1) % 3 + 1}.png`} alt="Avatar" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-600">{proposal.organizer}</div>
                                                    <div className="text-sm text-gray-400">{proposal.title}</div>
                                                </div>
                                            </div>
                                            <div className={`badge badge-sm badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Pending' ? 'warning' : 'error'}`}>{proposal.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}


const pieDataOptions = { // Separate options for Pie Chart for better readability
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { color: '#fff' } },
        tooltip: {
            backgroundColor: '#2D3748',
            bodyColor: '#fff',
            titleColor: '#fff',
            borderColor: '#6B7280',
            borderWidth: 1,
            callbacks: {
                label: (context) => `${context.label}: ${context.formattedValue} Proposals`,
            },
        },
    },
    chartArea: { backgroundColor: '#1E293B' }
};
