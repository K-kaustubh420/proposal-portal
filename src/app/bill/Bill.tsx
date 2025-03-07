// Bill.tsx (UNCHANGED - but shown here for completeness)
'use client';

import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Bill = ({ selectedProposal }) => {
  const [actualBills, setActualBills] = useState({});

  const handleImageChange = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `bills/${selectedProposal.id}/${index}/${file.name}`);

    try {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error("Upload error:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setActualBills((prevBills) => ({
              ...prevBills,
              [index]: { ...prevBills[index], imageURL: downloadURL },
            }));
          });
        }
      );
    } catch (error) {
      console.error("Error initiating upload:", error);
    }
  };

  const handleAmountChange = (event, index) => {
    const amount = event.target.value;
    setActualBills((prevBills) => ({
      ...prevBills,
      [index]: { ...prevBills[index], actualAmount: amount },
    }));
  };

  if (
    !selectedProposal ||
    !selectedProposal.detailedBudget ||
    selectedProposal.detailedBudget.length === 0
  ) {
    return <div>No detailed budget available.</div>;
  }

  return (
    <div className="mt-4 p-4 rounded-md">
      <p className="text-gray-700 font-semibold">Detailed Budget:</p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Main Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Add Actual Bill
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedProposal.detailedBudget.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="text" value={item.locationType || ''} className="border rounded p-2 w-full" disabled />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="text" value={item.mainCategory || ''} className="border rounded p-2 w-full" disabled />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="text" value={item.subCategory || ''} className="border rounded p-2 w-full" disabled />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="text" value={item.totalAmount?.toLocaleString() || 'N/A'} className="border rounded p-2 w-full" disabled />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={actualBills[index]?.actualAmount || ''}
                      onChange={(e) => handleAmountChange(e, index)}
                      className="border rounded p-2 w-24"
                    />
                    {actualBills[index]?.imageURL && (
                      <a href={actualBills[index].imageURL} target="_blank" rel="noopener noreferrer">
                        <img src={actualBills[index].imageURL} alt="Uploaded Bill" className="h-10 w-10 object-cover rounded" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bill;