// components/candidates/PaymentHistory.tsx
import { Card } from "../ui/card";
import { CreditCard } from "lucide-react";

interface PaymentHistoryProps {
  candidate: any;
}

export function PaymentHistory({ candidate }: PaymentHistoryProps) {
  const totalFee = candidate.totalFee;
  const paid = candidate.paidAmount;
  const remaining = totalFee - paid;
  const percentage = Math.floor((paid / totalFee) * 100);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Payment History</h2>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Fee</p>
          <p className="text-lg font-bold">{totalFee.toLocaleString()} DZD</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-lg font-bold text-green-700">{paid.toLocaleString()} DZD</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-lg font-bold text-red-700">{remaining.toLocaleString()} DZD</p>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Payment Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Payment Transactions */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Payment History</h3>
        {candidate.payments.map((payment: any, index: number) => (
          <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{payment.amount.toLocaleString()} DZD</p>
                <p className="text-sm text-gray-600">{payment.note || 'Payment'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{payment.date}</p>
              <p className="text-xs text-gray-500">Ref: {payment.id}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}