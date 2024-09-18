"use client"; // Ensure this is a client-side component

import { useState } from 'react';
import axios from 'axios';

// Output Component
const OutputComponent = ({ output }) => {
  return (
    <div className="bg-gray-100 border rounded-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-gray-800">Final Output (out.txt)</h2>
      <pre className="whitespace-pre-wrap break-words text-gray-700">{output}</pre>
    </div>
  );
};

// Record Component
const RecordComponent = ({ record }) => {
  return (
    <div className="bg-gray-100 border rounded-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-gray-800">Record File (record.txt)</h2>
      <pre className="whitespace-pre-wrap break-words text-gray-700">{record}</pre>
    </div>
  );
};

export default function Home() {
  const [inputFile, setInputFile] = useState(null);
  const [optabFile, setOptabFile] = useState(null);
  const [output, setOutput] = useState('');
  const [record, setRecord] = useState('');
  const [error, setError] = useState('');

  const handleInputFileChange = (e) => setInputFile(e.target.files[0]);
  const handleOptabFileChange = (e) => setOptabFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('input_file', inputFile);
    formData.append('optab_file', optabFile);

    try {
      const res = await axios.post('http://localhost:8000/process-files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOutput(res.data.output_file);  // Set output.txt content
      setRecord(res.data.record_file);  // Set record.txt content
      setError('');
    } catch (error) {
      console.error("Error processing files:", error);
      setError('Error processing files');
      setOutput('');
      setRecord('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">File Processing App</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Input File</label>
            <input
              type="file"
              onChange={handleInputFileChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Optab File</label>
            <input
              type="file"
              onChange={handleOptabFileChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Error</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {output && <OutputComponent output={output} />}
        {record && <RecordComponent record={record} />}
      </div>
    </div>
  );
}
