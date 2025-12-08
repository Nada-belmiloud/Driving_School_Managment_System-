// components/candidates/DocumentsChecklist.tsx
import { Button } from "../ui/button";
import { CheckCircle, XCircle, Edit } from "lucide-react";

interface DocumentsChecklistProps {
  candidate: any;
}

export function DocumentsChecklist({ candidate }: DocumentsChecklistProps) {
  const docsDone = candidate.documents.filter((d: any) => d.checked).length;
  const docsTotal = candidate.documents.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Documents Checklist</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Modify
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {docsDone} of {docsTotal} documents submitted
      </div>

      <div className="space-y-2">
        {candidate.documents.map((doc: any) => (
          <div key={doc.name} className="flex items-center gap-3">
            {doc.checked ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={doc.checked ? "text-gray-900" : "text-gray-500"}>
              {doc.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}