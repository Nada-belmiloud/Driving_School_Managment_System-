"use client";

import { useState } from "react";
import { Search, Phone, Mail, ChevronRight, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { mockCandidates, LICENSE_CATEGORIES, REQUIRED_DOCUMENTS } from "@/lib/mockData";
import { CandidateDetails } from "./CandidatesDetails"; // Make sure this matches your actual file name
import { formatDZD, getStatusStyle } from "../utils/utility";

export function CandidatesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    licenseCategory: "",
    documents: REQUIRED_DOCUMENTS.map(doc => ({ name: doc, checked: false })),
    totalFee: 34000,
    paymentMethod: "cash",
    installments: 3,
    firstPayment: 11333
  });

  const filtered = mockCandidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocumentCheck = (index: number) => {
    const newDocs = [...formData.documents];
    newDocs[index].checked = !newDocs[index].checked;
    setFormData({ ...formData, documents: newDocs });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setShowAddModal(false);
    setFormData({
      fullName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      licenseCategory: "",
      documents: REQUIRED_DOCUMENTS.map(doc => ({ name: doc, checked: false })),
      totalFee: 34000,
      paymentMethod: "cash",
      installments: 3,
      firstPayment: 11333
    });
  };

  // Handle candidate update
  const handleUpdateCandidate = (id: string, updatedFields: any) => {
    console.log('Update candidate:', id, updatedFields);
    // In a real app, you would update your state or make an API call here
  };

  // Handle quick actions
  const handleScheduleSession = (candidateId: string) => {
    console.log('Schedule session for:', candidateId);
    // Implement navigation or modal opening
  };

  const handleRecordPayment = (candidateId: string) => {
    console.log('Record payment for:', candidateId);
    // Implement navigation or modal opening
  };

  const handleAddExamResult = (candidateId: string) => {
    console.log('Add exam result for:', candidateId);
    // Implement navigation or modal opening
  };

  if (selectedCandidate) {
    return (
      <CandidateDetails
        candidateId={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onUpdateCandidate={handleUpdateCandidate}
        onScheduleSession={handleScheduleSession}
        onRecordPayment={handleRecordPayment}
        onAddExamResult={handleAddExamResult}
      />
    );
  }

  return (
    <>
      {/* Main content */}
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
            <p className="text-gray-600 text-sm">Manage candidate registrations and progress</p>
          </div>

          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Candidate
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Table */}
        <Card className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="text-left py-3">Candidate</th>
                <th className="text-left py-3">Contact</th>
                <th className="text-left py-3">License</th>
                <th className="text-left py-3">Documents</th>
                <th className="text-left py-3">Progress</th>
                <th className="text-left py-3">Current Phase</th>
                <th className="text-left py-3">Payment</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => {
                const totalFee = c.totalFee;
                const paid = c.paidAmount;
                const percentage = Math.floor((paid / totalFee) * 100);
                const paymentStyle = getStatusStyle(percentage);

                const docsDone = c.documents.filter((d) => d.checked).length;
                const docsTotal = c.documents.length;

                const currentPhaseObj = c.phases.find((p) => p.status !== "completed");
                const currentPhase = currentPhaseObj
                  ? currentPhaseObj.phase.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                  : "Completed";

                const progress = c.phases.filter((p) => p.status === "completed").length;

                return (
                  <tr key={c.id} className="border-b text-sm hover:bg-gray-50">
                    <td className="py-4">
                      <div className="text-gray-900 font-medium">{c.name}</div>
                      <div className="text-gray-500">{c.age} years old</div>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" /> {c.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Mail className="w-4 h-4 text-gray-400" /> {c.email}
                      </div>
                    </td>

                    <td className="py-4">
                      <Badge variant="secondary">{c.licenseCategory}</Badge>
                    </td>

                    <td className="py-4 text-gray-700">
                      <div>{docsDone} / {docsTotal}</div>
                      <Badge className={docsDone === docsTotal ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {docsDone === docsTotal ? "Complete" : "Pending"}
                      </Badge>
                    </td>

                    <td className="py-4 text-gray-700">
                      {progress} / {c.phases.length}
                      <div className="text-xs text-gray-500">phases</div>
                    </td>

                    <td className="py-4">
                      <Badge
                        variant="secondary"
                        className={
                          currentPhase === "Driving" ? "text-blue-600 border-blue-200" :
                          currentPhase === "Highway Code" ? "text-purple-600 border-purple-200" :
                          currentPhase === "Parking" ? "text-orange-600 border-orange-200" :
                          "text-gray-600 border-gray-200"
                        }
                      >
                        {currentPhase}
                      </Badge>
                    </td>

                    <td className="py-4">
                      <div className="font-medium text-gray-900">
                        {formatDZD(paid)} / {formatDZD(totalFee)}
                      </div>
                      <div className="w-24 h-2 rounded-full bg-gray-200 mt-1">
                        <div className={`h-2 ${paymentStyle.barColor} rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </td>

                    <td>
                      <button 
                        onClick={() => setSelectedCandidate(c.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="text-gray-400 w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-20">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Candidate</h2>
                <p className="text-sm text-gray-600">Fill out the form to register a new candidate</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                        +213
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="555 123 456"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d\s]/g, '');
                          setFormData({ ...formData, phone: value });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="example@email.dz"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Category <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.licenseCategory}
                  onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select license category</option>
                  {LICENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label} - {cat.description}</option>
                  ))}
                </select>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Documents</h3>
                <p className="text-sm text-gray-600 mb-4">Check the boxes below for documents that have been submitted</p>
                <div className="space-y-3">
                  {formData.documents.map((doc, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={doc.checked}
                          onChange={() => handleDocumentCheck(index)}
                          className="w-5 h-5 appearance-none border-2 border-gray-300 rounded cursor-pointer checked:bg-green-500 checked:border-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {doc.checked && (
                          <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-900">{doc.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Documents submitted: {formData.documents.filter(d => d.checked).length} of {formData.documents.length}
                </p>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Training Fee</span>
                      <span className="text-xl font-bold text-gray-900">{formatDZD(34000)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === "cash"}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">Cash</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={formData.paymentMethod === "bank"}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">Bank Transfer</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Installments</label>
                    <select
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 (Full payment: {formatDZD(34000)})</option>
                      <option value={2}>2 (2 payments of {formatDZD(17000)} each)</option>
                      <option value={3}>3 (3 payments of ~{formatDZD(11333)} each)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Payment Amount</label>
                    <input
                      type="number"
                      value={formData.firstPayment}
                      onChange={(e) => setFormData({ ...formData, firstPayment: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}