import React from 'react'

import { Plus, Search, Filter, Eye, Edit, Download } from "lucide-react";
 const MedicalRecords = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search patient records..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Visit</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Diagnosis</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'John Doe', id: 'P-2024-001', visit: '2024-02-05', diagnosis: 'Hypertension', status: 'Active' },
              { name: 'Jane Smith', id: 'P-2024-002', visit: '2024-02-04', diagnosis: 'Type 2 Diabetes', status: 'Active' },
              { name: 'Mike Johnson', id: 'P-2024-003', visit: '2024-02-03', diagnosis: 'Asthma', status: 'Follow-up' },
              { name: 'Sarah Williams', id: 'P-2024-004', visit: '2024-02-02', diagnosis: 'Migraine', status: 'Active' },
              { name: 'Robert Brown', id: 'P-2024-005', visit: '2024-02-01', diagnosis: 'Back Pain', status: 'Recovered' },
            ].map((record, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{record.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span className="font-medium text-gray-900">{record.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{record.id}</td>
                <td className="px-6 py-4 text-gray-600">{record.visit}</td>
                <td className="px-6 py-4 text-gray-900">{record.diagnosis}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'Active' ? 'bg-green-100 text-green-700' :
                    record.status === 'Follow-up' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

export default MedicalRecords;