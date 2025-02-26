export default function EventProposalForm() {
  return (
    <div className="bg-blue-300">
    <div className="p-6 card bg-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submit Proposal</h2>
      
      <label className="block mb-2">Organizing Department:</label>
      <input type="text" placeholder="Organizing Department" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Event Title:</label>
      <input type="text" placeholder="Event Title" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Duration of Event:</label>
      <input type="text" placeholder="Duration of Event" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Event Date:</label>
      <input type="date" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Category:</label>
      <select className="select select-bordered bg-transparent w-full mb-4">
        <option>Workshop</option>
        <option>Seminar</option>
        <option>Conference</option>
      </select>
      
      <label className="block mb-2">Designation:</label>
      <input type="text" placeholder="Designation" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Total Estimated Budget (₹):</label>
      <input type="number" placeholder="Total Estimated Budget" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Sponsorship Details:</label>
      <textarea placeholder="Sponsorship Details" className="textarea textarea-info bg-transparent w-full mb-4"></textarea>
      
      <label className="block mb-2">Past Events (2021-2024):</label>
      <textarea placeholder="Past Events (2021-2024)" className="textarea textarea-info bg-transparent w-full mb-4"></textarea>
      
      <label className="block mb-2">Any Other Relevant Details:</label>
      <textarea placeholder="Any Other Relevant Details" className="textarea textarea-info bg-transparent w-full mb-4"></textarea>
      
      <label className="block mb-2">Convener Name:</label>
      <input type="text" placeholder="Your Name" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Convener Email:</label>
      <input type="email" placeholder="Your Email" className="input bg-transparent input-info w-full mb-4" />
      
      <h3 className="text-xl font-bold mt-6 mb-2">Funding Details (₹)</h3>
      <label className="block mb-2">Fund from University:</label>
      <input type="number" placeholder="0" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Fund from Registration:</label>
      <input type="number" placeholder="5" className="input bg-transparent input-infow-full mb-4" />
      
      <label className="block mb-2">Fund from Sponsorship:</label>
      <input type="number" placeholder="0" className="input bg-transparent input-info w-full mb-4" />
      
      <label className="block mb-2">Fund from Other Sources:</label>
      <input type="number" placeholder="5" className="input bg-transparent input-info w-full mb-4" />
      <div className="card">
      <h3 className="text-xl font-bold mt-6 mb-2">Detailed Budget</h3>
      <table className="table card rounded-md w-full border-collapse border-info">
        <thead>
          <tr className="bg-blue-500 text-black">
            <th className="border p-2">S.No</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Cost/Unit (₹)</th>
            <th className="border p-2">Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td className="border p-2">{i}</td>
              <td className="border p-2"><input type="text" className="input bg-transparent input-info w-full" /></td>
              <td className="border p-2"><input type="number" className="input bg-transparent input-info w-full" /></td>
              <td className="border p-2"><input type="number" className="input bg-transparent input-info w-full" /></td>
              <td className="border p-2"><input type="number" className="input bg-transparent input-info w-full" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-outline mt-2">+ Add Row</button></div>
      
      <h3 className="text-xl font-bold mt-6 mb-2">Sponsorship Details</h3>
      <table className="table w-full border-collapse border border-blue-300">
        <thead>
          <tr className="bg-blue-500 text-black">
            <th className="border p-2">Sponsorship Details</th>
            <th className="border p-2">Associating Agencies</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2"><input type="text" className="input bg-transparent input-info w-full" /></td>
            <td className="border p-2"><input type="text" className="input bg-transparent input-info w-full" /></td>
          </tr>
        </tbody>
      </table>
      <button className="btn btn-outline mt-2">+ Add Row</button>
      
      <button className="btn btn-primary w-full mt-6">Submit Proposal</button>
    </div>
    </div>
  );
}
