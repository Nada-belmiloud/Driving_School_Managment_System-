// app/dashboard/payments/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { mockCandidates } from '@/lib/mockData';
import { formatDZD, getStatusStyle } from '@/components/utils/utility';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, TrendingUp, Calendar, User, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

// Reusable Status Card Component
const StatusCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  period: string;
  className?: string;
  icon?: React.ReactNode;
}> = ({ title, value, subtext, period, className = '', icon }) => {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 min-w-[250px] ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{period}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{subtext}</p>
        </div>
      </div>
    </div>
  );
};

// Simple Payment Modal Component
const PaymentModal: React.FC<{
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: (candidateId: string, amount: number, date: string) => void;
}> = ({ candidate, isOpen, onClose, onPaymentAdded }) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const remainingFee = candidate.totalFee - candidate.paidAmount;
  const maxAmount = remainingFee;
  const totalPaid = candidate.paidAmount + (parseInt(amount) || 0);
  const remainingAfterPayment = remainingFee - (parseInt(amount) || 0);

  React.useEffect(() => {
    if (isOpen) {
      setAmount(maxAmount > 0 ? maxAmount.toString() : '0');
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, maxAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseInt(amount);
    
    if (paymentAmount <= 0) {
      alert('Amount must be greater than 0.');
      return;
    }
    
    if (paymentAmount > maxAmount) {
      alert(`Amount cannot exceed remaining fee of ${formatDZD(maxAmount)}.`);
      return;
    }

    onPaymentAdded(candidate.id, paymentAmount, paymentDate);
    onClose();
  };

  const handlePayFull = () => {
    setAmount(maxAmount.toString());
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      if (value === '' || (numValue >= 0 && numValue <= maxAmount)) {
        setAmount(value);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
           
            Add Payment
          </DialogTitle>
          <DialogDescription>
            Record a new payment for {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total Fee:</span>
                <span className="font-medium text-gray-800">{formatDZD(candidate.totalFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Already Paid:</span>
                <span className="font-medium text-green-600">{formatDZD(candidate.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-semibold text-gray-800">Remaining Balance:</span>
                <span className="text-sm font-bold text-red-500">{formatDZD(remainingFee)}</span>
              </div>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">

              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-900">Cash</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-900">Bank Transfer</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-900">Credit Card</span>
              </label>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              
              Amount (DZD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={`Maximum: ${formatDZD(maxAmount)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
              />
              <button
                type="button"
                onClick={handlePayFull}
                className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 border-l border-gray-300"
              >
                Pay Full
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum: {formatDZD(maxAmount)}
            </p>
          </div>

          {/* Summary After Payment */}
          {amount && parseInt(amount) > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Summary after payment:</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className={`font-medium ${totalPaid === candidate.totalFee ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatDZD(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Remaining:</span>
                  <span className={`font-medium ${remainingAfterPayment === 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatDZD(remainingAfterPayment)}
                  </span>
                </div>
                {remainingAfterPayment === 0 && (
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                    <span className="text-green-600 font-medium">Status:</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                     
                      Fully Paid
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || parseInt(amount) <= 0}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format the list of recent payments for the table
const getRecentPayments = (candidates: any[]) => {
  const allPayments = candidates.flatMap(candidate => 
    candidate.payments.map((payment: any) => ({
      ...payment,
      candidateName: candidate.name,
    }))
  );

  return allPayments
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
};

// Main Payments Page Component
export default function PaymentsPage() {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Calculations
  const totalCollected = useMemo(() => 
    candidates.reduce((sum: number, c: any) => sum + c.paidAmount, 0), [candidates]
  );
  
  const totalOutstanding = useMemo(() => 
    candidates.reduce((sum: number, c: any) => sum + (c.totalFee - c.paidAmount), 0), [candidates]
  );

  const totalFeeValue = useMemo(() => 
    candidates.reduce((sum: number, c: any) => sum + c.totalFee, 0), [candidates]
  );

  // Table Data
  const outstandingCandidates = candidates.filter((c: any) => c.paidAmount < c.totalFee);
  const recentPayments = getRecentPayments(candidates);

  // Handlers
  const handleAddPaymentClick = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handlePaymentAdded = (candidateId: string, amount: number, date: string) => {
    setCandidates((prevCandidates: any[]) => 
      prevCandidates.map((candidate: any) => {
        if (candidate.id === candidateId) {
          const newPayment = {
            id: `p${Date.now()}`,
            amount: amount,
            date: date,
            method: 'cash' as const,
            note: 'New payment recorded',
          };
          
          return {
            ...candidate,
            paidAmount: candidate.paidAmount + amount,
            payments: [...candidate.payments, newPayment],
          };
        }
        return candidate;
      })
    );
    setSelectedCandidate(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="text-blue-600" size={28} />
        <h1 className="text-2xl font-semibold text-gray-800">Payments</h1>
      </div>
      <p className="text-gray-500 mb-8">Track payments and outstanding balances</p>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatusCard
          title="Total Collected"
          value="135,999 DZD"
          subtext="alltime"
          period="~ 10"
          icon={<Wallet className="text-green-500" size={20} />}
        />
        <StatusCard
          title="Pending Payments"
          value="34,001 DZD"
          subtext="2 candidates"
          period="Expected"
          icon={<AlertCircle className="text-orange-500" size={20} />}
        />
        <StatusCard
          title="Total Revenue"
          value="170,000 DZD"
          subtext="Expected"
          period="alltime"
          icon={<DollarSign className="text-blue-500" size={20} />}
        />
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-500" size={20} />
          Recent Payments
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.map((payment: any, index: number) => (
                <tr key={`${payment.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                    
                    {payment.candidateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                    {formatDZD(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outstanding Balances Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-orange-500" size={20} />
          Outstanding Balances
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {outstandingCandidates.map((candidate: any) => {
                const remaining = candidate.totalFee - candidate.paidAmount;
                const percentage = (candidate.paidAmount / candidate.totalFee) * 100;
                const status = getStatusStyle(percentage);

                return (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      
                      {candidate.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatDZD(candidate.totalFee)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatDZD(candidate.paidAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500 font-medium">{formatDZD(remaining)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-20 h-2 rounded-full ${status.bgColor} overflow-hidden`}>
                          <div
                            className={`h-full ${status.barColor}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${status.textColor}`}>{Math.round(percentage)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleAddPaymentClick(candidate)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-2"
                      >
                        <CreditCard className="text-blue-600" size={16} />
                        Add Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedCandidate && (
        <PaymentModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPaymentAdded={handlePaymentAdded}
        />
      )}
    </div>
  );
}