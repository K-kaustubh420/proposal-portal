"use client";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Trash2 } from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function EventProposalForm() {
  // Initialize startDate to null initially
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Form field states (rest remain the same)
  const [organizingDepartment, setOrganizingDepartment] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [durationEvent, setDurationEvent] = useState('');
  const [category, setCategory] = useState('');
  const [designation, setDesignation] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [sponsorshipDetails, setSponsorshipDetails] = useState('');
  const [pastEvents, setPastEvents] = useState('');
  const [relevantDetails, setRelevantDetails] = useState('');
  const [chiefGuestName, setChiefGuestName] = useState('');
  const [chiefGuestDesignation, setChiefGuestDesignation] = useState('');
  const [convenerName, setConvenerName] = useState('');
  const [convenerEmail, setConvenerEmail] = useState('');
  const [fundUniversity, setFundUniversity] = useState('');
  const [fundRegistration, setFundRegistration] = useState('');
  const [fundSponsorship, setFundSponsorship] = useState('');
  const [fundOther, setFundOther] = useState('');

  // State for Detailed Budget Rows (rest remain the same)
  const [detailedBudgetRows, setDetailedBudgetRows] = useState([
    { id: 1, description: '', quantity: '', costPerUnit: '', totalAmount: '' },
    { id: 2, description: '', quantity: '', costPerUnit: '', totalAmount: '' },
    { id: 3, description: '', quantity: '', costPerUnit: '', totalAmount: '' },
  ]);

  // State for Sponsorship Details Rows (rest remain the same)
  const [sponsorshipRows, setSponsorshipRows] = useState([
    { id: 1, sponsorshipType: '', associatingAgencies: '' }
  ]);

  // Function to add a new row to Detailed Budget (rest remain the same)
  const addDetailedBudgetRow = () => {
    setDetailedBudgetRows([...detailedBudgetRows, { id: detailedBudgetRows.length + 1, description: '', quantity: '', costPerUnit: '', totalAmount: '' }]);
  };

  // Function to delete a row from Detailed Budget (rest remain the same)
  const deleteDetailedBudgetRow = (idToDelete) => {
    setDetailedBudgetRows(detailedBudgetRows.filter(row => row.id !== idToDelete));
  };

  // Function to handle changes in Detailed Budget Rows (rest remain the same)
  const handleDetailedBudgetChange = (id, field, value) => {
    const updatedRows = detailedBudgetRows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // Convert to numbers and calculate total
        const quantity = parseFloat(updatedRow.quantity) || 0;
        const costPerUnit = parseFloat(updatedRow.costPerUnit) || 0;
        updatedRow.totalAmount = quantity * costPerUnit;

        return updatedRow;
      }
      return row;
    });

    setDetailedBudgetRows(updatedRows);
  };

  // Function to add a new row to Sponsorship Details (rest remain the same)
  const addSponsorshipRow = () => {
    setSponsorshipRows([...sponsorshipRows, { id: sponsorshipRows.length + 1, sponsorshipType: '', associatingAgencies: '' }]);
  };

  // Function to delete a row from Sponsorship Details (rest remain the same)
  const deleteSponsorshipRow = (idToDelete) => {
    setSponsorshipRows(sponsorshipRows.filter(row => row.id !== idToDelete));
  };

  // Function to handle changes in Sponsorship Rows (rest remain the same)
  const handleSponsorshipChange = (id, field, value) => {
    const updatedRows = sponsorshipRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setSponsorshipRows(updatedRows);
  };

  // Function for form submission (rest remain the same)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate total detailed budget (rest remain the same)
    const totalDetailedBudget = detailedBudgetRows.reduce((sum, row) => sum + (parseFloat(row.totalAmount) || 0), 0);

    // Check if estimated budget matches (rest remain the same)
    if (totalDetailedBudget !== parseFloat(estimatedBudget)) {
      alert(`Error: Estimated Budget and Detailed Budget do not match! \nEstimated: ${estimatedBudget} \nDetailed: ${totalDetailedBudget}`);
      return; // Stop form submission
    }

    try {
      const eventProposalsCollection = collection(db, 'eventProposals');
      await addDoc(eventProposalsCollection, {
        organizingDepartment,
        eventTitle,
        eventDescription,
        durationEvent,
        eventDate: startDate?.toISOString(), // Use optional chaining and toISOString only if startDate is a Date object
        category,
        designation,
        estimatedBudget,
        sponsorshipDetails,
        pastEvents,
        relevantDetails,
        chiefGuestName,
        chiefGuestDesignation,
        convenerName,
        convenerEmail,
        fundingDetails: {
          universityFund: fundUniversity,
          registrationFund: fundRegistration,
          sponsorshipFund: fundSponsorship,
          otherSourcesFund: fundOther,
        },
        detailedBudget: detailedBudgetRows,
        sponsorshipDetailsRows: sponsorshipRows,
        submissionTimestamp: new Date().toISOString(),
      });

      alert('Event proposal submitted successfully!');

      // Reset form fields (rest remain the same)
      setOrganizingDepartment('');
      setEventTitle('');
      setEventDescription('');
      setDurationEvent('');
      setStartDate(new Date()); // Reset startDate to current date for next form submission
      setCategory('');
      setDesignation('');
      setEstimatedBudget('');
      setSponsorshipDetails('');
      setPastEvents('');
      setRelevantDetails('');
      setChiefGuestName('');
      setChiefGuestDesignation('');
      setConvenerName('');
      setConvenerEmail('');
      setFundUniversity('');
      setFundRegistration('');
      setFundSponsorship('');
      setFundOther('');
      setDetailedBudgetRows([
        { id: 1, description: '', quantity: '', costPerUnit: '', totalAmount: '' },
        { id: 2, description: '', quantity: '', costPerUnit: '', totalAmount: '' },
        { id: 3, description: '', quantity: '', costPerUnit: '', totalAmount: '' }
      ]);
      setSponsorshipRows([{ id: 1, sponsorshipType: '', associatingAgencies: '' }]);

    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    }
  };

  useEffect(() => {
    // Set initial date only on the client-side after component mount
    setStartDate(new Date());
  }, []);


  return (
    <>
      <div style={{
        backgroundImage: "url('/SRMIST-BANNER.jpg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}>
        <div className="bg-blue-50 bg-opacity-70 min-h-screen flex justify-center items-center py-10">
          <div className="card bg-white shadow-xl rounded-2xl max-w-7xl w-full mx-4 md:mx-0">
            <div className="card-body p-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Submit Event Proposal</h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="organizing-department">
                    Organizing Department
                  </label>
                  <input
                    type="text"
                    id="organizing-department"
                    placeholder="Department Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={organizingDepartment}
                    onChange={(e) => setOrganizingDepartment(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="event-title">
                    Event Title
                  </label>
                  <input
                    type="text"
                    id="event-title"
                    placeholder="Enter Event Title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="event-description">
                    Event Description
                  </label>
                  <textarea
                    id="event-description"
                    placeholder="Enter Event Description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    required
                  />
                </div>


                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="duration-event">
                    Duration of Event
                  </label>
                  <input
                    type="text"
                    id="duration-event"
                    placeholder="e.g., 1 day, 2 days, etc."
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={durationEvent}
                    onChange={(e) => setDurationEvent(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="event-date">
                    Event Date
                  </label>
                  {/* Conditionally render DatePicker only when startDate is initialized on client-side */}
                  {startDate !== null && (
                    <DatePicker
                      id="event-date"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                      placeholderText="Select Event Date"
                      dateFormat="MMMM d, yyyy"
                      required
                    />
                  )}
                </div>


                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="designation">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="designation"
                    placeholder="e.g., Professor, Student Coordinator"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="estimated-budget">
                    Total Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    id="estimated-budget"
                    placeholder="Enter Budget in Rupees"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="sponsorship-details">
                    Sponsorship Details
                  </label>
                  <textarea
                    id="sponsorship-details"
                    placeholder="Details about potential sponsors or collaborations"
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={sponsorshipDetails}
                    onChange={(e) => setSponsorshipDetails(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="past-events">
                    Past Events (2021-2024)
                  </label>
                  <textarea
                    id="past-events"
                    placeholder="List any past relevant events organized by the department (2021-2024)"
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={pastEvents}
                    onChange={(e) => setPastEvents(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="relevant-details">
                    Any Other Relevant Details
                  </label>
                  <textarea
                    id="relevant-details"
                    placeholder="Include any other details that might be relevant to your proposal"
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={relevantDetails}
                    onChange={(e) => setRelevantDetails(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="chief-guest-name">
                    Chief Guest / Celebrity Name
                  </label>
                  <input
                    type="text"
                    id="chief-guest-name"
                    placeholder="Enter Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={chiefGuestName}
                    onChange={(e) => setChiefGuestName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="chief-guest-designation">
                    Chief Guest / Celebrity Designation
                  </label>
                  <input
                    type="text"
                    id="chief-guest-designation"
                    placeholder="Enter Designation"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={chiefGuestDesignation}
                    onChange={(e) => setChiefGuestDesignation(e.target.value)}
                    required
                  />
                </div>


                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="convener-name">
                    Convener Name
                  </label>
                  <input
                    type="text"
                    id="convener-name"
                    placeholder="Enter Your Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={convenerName}
                    onChange={(e) => setConvenerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="convener-email">
                    Convener Email
                  </label>
                  <input
                    type="email"
                    id="convener-email"
                    placeholder="Enter Your Email Address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                    value={convenerEmail}
                    onChange={(e) => setConvenerEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Funding Details (₹)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-university">
                        University Fund
                      </label>
                      <input type="number" id="fund-university" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={fundUniversity}
                        onChange={(e) => setFundUniversity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-registration">
                        Registration Fund
                      </label>
                      <input type="number" id="fund-registration" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={fundRegistration}
                        onChange={(e) => setFundRegistration(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-sponsorship">
                        Sponsorship Fund
                      </label>
                      <input type="number" id="fund-sponsorship" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={fundSponsorship}
                        onChange={(e) => setFundSponsorship(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-other">
                        Other Sources Fund
                      </label>
                      <input type="number" id="fund-other" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                        value={fundOther}
                        onChange={(e) => setFundOther(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Budget</h3>
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full shadow-md rounded-md">
                      <thead className="bg-blue-50">
                        <tr className="text-left">
                          <th className="px-4 py-2">S.No</th>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2">Quantity</th>
                          <th className="px-4 py-2">Cost/Unit (₹)</th>
                          <th className="px-4 py-2">Total Amount (₹)</th>
                          <th className="px-4 py-2">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedBudgetRows.map((row) => (
                          <tr key={row.id} className="border-b border-gray-200">
                            <td className="px-4 py-1">{row.id}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-between p-3 rounded-lg w-full">

                                {/* Main Category Dropdown (Left) */}
                                <div className="w-1/3 pr-2">
                                  <select
                                    className="select select-bordered w-full text-gray-700 font-medium bg-gray-100 hover:bg-white transition focus:ring-2 focus:ring-blue-500"
                                    value={row.mainCategory || ""}
                                    onChange={(e) => handleDetailedBudgetChange(row.id, 'mainCategory', e.target.value)}
                                  >
                                    <option value="" disabled hidden>Main Category</option>
                                    <option value="Budgetary Expenditures">Budgetary Expenditures</option>
                                    <option value="Publicity">Publicity</option>
                                    <option value="General">General</option>
                                    <option value="Honorarium">Honorarium</option>
                                    <option value="Hospitality">Hospitality</option>
                                    <option value="Inaugural and Valedictory">Inaugural and Valedictory</option>
                                    <option value="Resource Materials">Resource Materials</option>
                                    <option value="Conference Paper Publication">Conference Paper Publication</option>
                                  </select>
                                </div>

                                {/* Subcategory Dropdown (Middle) */}
                                <div className="w-1/3 px-2">
                                  <select
                                    className="select select-bordered w-full text-gray-700 font-medium bg-gray-100 hover:bg-white transition focus:ring-2 focus:ring-blue-500"
                                    value={row.subCategory || ""}
                                    onChange={(e) => handleDetailedBudgetChange(row.id, 'subCategory', e.target.value)}
                                  >
                                    <option value="" disabled hidden>Subcategory</option>

                                    {row.mainCategory === "Budgetary Expenditures" && (
                                      <>
                                        <option value="Number of Sessions Planned">Number of Sessions Planned</option>
                                        <option value="Number of Keynote Speakers">Number of Keynote Speakers</option>
                                        <option value="Number of Session Judges">Number of Session Judges</option>
                                        <option value="Number of Celebrities / Chief Guests">Number of Celebrities / Chief Guests</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Publicity" && (
                                      <>
                                        <option value="Invitation">Invitation</option>
                                        <option value="Press Coverage">Press Coverage</option>
                                      </>
                                    )}
                                    {row.mainCategory === "General" && (
                                      <>
                                        <option value="Conference Kits">Conference Kits</option>
                                        <option value="Printing and Stationery">Printing and Stationery</option>
                                        <option value="Secretarial Expenses">Secretarial Expenses</option>
                                        <option value="Mementos">Mementos</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Honorarium" && (
                                      <>
                                        <option value="Keynote Speakers">Keynote Speakers</option>
                                        <option value="Session Judges">Session Judges</option>
                                        <option value="Chief Guests">Chief Guests</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Hospitality" && (
                                      <>
                                        <option value="Train / Flight for Chief Guest / Keynote Speakers">Train / Flight for Chief Guest / Keynote Speakers</option>
                                        <option value="Accommodation for Chief Guest / Keynote Speakers">Accommodation for Chief Guest / Keynote Speakers</option>
                                        <option value="Food and Beverages for Chief Guest / Keynote Speakers">Food and Beverages for Chief Guest / Keynote Speakers</option>
                                        <option value="Local Travel Expenses">Local Travel Expenses</option>
                                        <option value="Food for Participants">Food for Participants</option>
                                        <option value="Food & Snacks for Volunteers / Organizers">Food & Snacks for Volunteers / Organizers</option>
                                        <option value="Hostel Accommodation">Hostel Accommodation</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Inaugural and Valedictory" && (
                                      <>
                                        <option value="Banners, Pandal etc">Banners, Pandal etc</option>
                                        <option value="Lighting and Decoration">Lighting and Decoration</option>
                                        <option value="Flower Bouquet">Flower Bouquet</option>
                                        <option value="Cultural Events">Cultural Events</option>
                                        <option value="Field Visits / Sightseeing">Field Visits / Sightseeing</option>
                                        <option value="Miscellaneous">Miscellaneous</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Resource Materials" && (
                                      <>
                                        <option value="Preparation, Printing, Binding">Preparation, Printing, Binding</option>
                                      </>
                                    )}
                                    {row.mainCategory === "Conference Paper Publication" && (
                                      <>
                                        <option value="Extended Abstract">Extended Abstract</option>
                                        <option value="Full Paper">Full Paper</option>
                                      </>
                                    )}
                                  </select>
                                </div>

                                {/* Domestic / International Radio Buttons (Right) */}
                                <div className="w-1/3 pl-2 gap-4">
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black transition">
                                    <input
                                      type="radio"
                                      name={`location-${row.id}`}
                                      value="Domestic"
                                      className="radio radio-primary"
                                      checked={row.locationType === "Domestic"}
                                      onChange={(e) => handleDetailedBudgetChange(row.id, 'locationType', e.target.value)}
                                    />
                                    <span className="text-sm">Domestic</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-black transition">
                                    <input
                                      type="radio"
                                      name={`location-${row.id}`}
                                      value="International"
                                      className="radio radio-primary"
                                      checked={row.locationType === "International"}
                                      onChange={(e) => handleDetailedBudgetChange(row.id, 'locationType', e.target.value)}
                                    />
                                    <span className="text-sm">International</span>
                                  </label>
                                </div>

                              </div>
                            </td>

                            <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" value={row.quantity} onChange={(e) => handleDetailedBudgetChange(row.id, 'quantity', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" value={row.costPerUnit} onChange={(e) => handleDetailedBudgetChange(row.id, 'costPerUnit', e.target.value)} /></td>
                            <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline" value={row.totalAmount || 0} readOnly />
                            </td>

                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => deleteDetailedBudgetRow(row.id)}
                                className="btn btn-sm btn-circle btn-error text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={addDetailedBudgetRow} className="btn btn-outline mt-4 rounded-full">+ Add Row</button></div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sponsorship Details</h3>
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full shadow-md rounded-md">
                      <thead className="bg-blue-50">
                        <tr className="text-left">
                          <th className="px-4 py-2">Sponsorship Type</th>
                          <th className="px-4 py-2">Associating Agencies</th>
                          <th className="px-4 py-2">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sponsorshipRows.map((row) => (
                          <tr key={row.id} className="border-b border-gray-200">
                            <td className="border-b border-gray-200 px-4 py-2"><input type="text" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" value={row.sponsorshipType} onChange={(e) => handleSponsorshipChange(row.id, 'sponsorshipType', e.target.value)} /></td>
                            <td className="border-b border-gray-200 px-4 py-2"><input type="text" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" value={row.associatingAgencies} onChange={(e) => handleSponsorshipChange(row.id, 'associatingAgencies', e.target.value)} /></td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => deleteSponsorshipRow(row.id)}
                                className="btn btn-sm btn-circle btn-error text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={addSponsorshipRow} className="btn btn-outline mt-4 rounded-full">+ Add Row</button>
                </div>

                <div className="mt-10">
                  <button type="submit" className="btn btn-primary w-full rounded-full text-lg font-semibold py-3 hover:shadow-xl transition-shadow duration-300">
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}