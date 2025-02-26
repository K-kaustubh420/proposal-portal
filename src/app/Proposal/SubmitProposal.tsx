"use client";
import React,{useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export default function EventProposalForm() {
  const [startDate, setStartDate] = useState(new Date());
  return ( <>
    <div className="bg-blue-50 min-h-screen flex justify-center items-center py-10"> {/* Light grey background, centered content */}
      <div className="card bg-white shadow-xl rounded-2xl max-w-3xl w-full mx-4 md:mx-0"> {/* White card, shadow, rounded corners, max width */}
        <div className="card-body p-8"> {/* Padding inside the card */}
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Submit Event Proposal</h2> {/* Larger, bolder heading */}

          <form className="space-y-6"> {/* Spacing between form groups */}
            <div>
              <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="organizing-department"> {/* Styled label */}
                Organizing Department
              </label>
              <input
                type="text"
                id="organizing-department"
                placeholder="Department Name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
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
              />
            </div>

            <div>
              <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="event-date">
                Event Date
              </label>
              <DatePicker
                id="event-date"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholderText="Select Event Date"
                dateFormat="MMMM d, yyyy"
           
              />
            </div>


            <div>
              <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
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
              ></textarea>
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
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Funding Details (₹)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {/* Grid layout for funding details */}
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-university">
                    University Fund
                  </label>
                  <input type="number" id="fund-university" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-registration">
                    Registration Fund
                  </label>
                  <input type="number" id="fund-registration" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-sponsorship">
                    Sponsorship Fund
                  </label>
                  <input type="number" id="fund-sponsorship" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 bg-white text-sm font-bold mb-2" htmlFor="fund-other">
                    Other Sources Fund
                  </label>
                  <input type="number" id="fund-other" placeholder="0" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Budget</h3>
              <div className="overflow-x-auto"> {/* For horizontal scrolling on smaller screens */}
                <table className="table-auto w-full shadow-md rounded-md">
                  <thead className="bg-gray-100">
                    <tr className="text-left">
                      <th className="px-4 py-2">S.No</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Cost/Unit (₹)</th>
                      <th className="px-4 py-2">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="px-4 py-2">{i}</td>
                        <td className="px-4 py-2"><input type="text" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                        <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                        <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                        <td className="px-4 py-2"><input type="number" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-outline mt-4 rounded-full">+ Add Row</button></div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sponsorship Details</h3>
              <div className="overflow-x-auto">
                <table className="table-auto w-full shadow-md rounded-md">
                  <thead className="bg-gray-100">
                    <tr className="text-left">
                      <th className="px-4 py-2">Sponsorship Type</th>
                      <th className="px-4 py-2">Associating Agencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-200 px-4 py-2"><input type="text" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                      <td className="border-b border-gray-200 px-4 py-2"><input type="text" className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="btn btn-outline mt-4 rounded-full">+ Add Row</button>
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
    </>
  );
}