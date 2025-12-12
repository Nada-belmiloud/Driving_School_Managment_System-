// components/AddPaymentModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Candidate } from '../../types';
import { formatDZD } from '../utils/utility';


interface AddPaymentModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: (candidateId: string, amount: number, date: string) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onPaymentAdded 
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // More reliable date format

  const remainingFee = useMemo(() => candidate.totalFee - candidate.paidAmount, [candidate]);
  const maxAmount = remainingFee;
  const totalPaid = candidate.paidAmount + (parseInt(amount) || 0);
  const remainingAfterPayment = remainingFee - (parseInt(amount) || 0);

  useEffect(() => {
    if (isOpen) {
      setAmount(maxAmount > 0 ? maxAmount.toString() : '0');
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, maxAmount]);

  if (!isOpen) return null;

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

    if (paymentAmount > 0 && paymentAmount <= maxAmount) {
      onPaymentAdded(candidate.id, paymentAmount, paymentDate);
      onClose();
    }
  };

  const handlePayFull = () => {
    setAmount(maxAmount.toString());
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      if (value === '' || (numValue >= 0 && numValue <= maxAmount)) {
        setAmount(value);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-4">
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add Payment</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Record a new payment for <strong>{candidate.name}</strong>
        </p>

        {/* Payment Summary */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Fee:</span>
            <span className="font-medium text-gray-800">{formatDZD(candidate.totalFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid:</span>
            <span className="font-medium text-green-600">{formatDZD(candidate.paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-lg font-semibold text-gray-800">Remaining:</span>
            <span className="text-lg font-bold text-red-500">{formatDZD(remainingFee)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Date Field */}
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              id="payment-date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (DZD) *
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
                placeholder={`Max: ${formatDZD(maxAmount)}`}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-20 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handlePayFull}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Pay Full
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum: {formatDZD(maxAmount)}
            </p>
          </div>
          
          {/* Summary After Payment */}
          {amount && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700">Summary after payment:</p>
              <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className={`font-medium ${totalPaid === candidate.totalFee ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatDZD(totalPaid)}
                  </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">New Remaining:</span>
                  <span className={`font-medium ${remainingAfterPayment === 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatDZD(remainingAfterPayment)}
                  </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || parseInt(amount) <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;