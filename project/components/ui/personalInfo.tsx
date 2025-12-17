// components/candidates/PersonalInfo.tsx
import { Phone, Mail, User, Calendar } from "lucide-react";

interface PersonalInfoProps {
  candidate: any;
}

export function PersonalInfo({ candidate }: PersonalInfoProps) {
  const getLicenseDescription = (category: string) => {
    const descriptions: { [key: string]: string } = {
      'A1': 'Light motorcycles, tricycles, quadricycles',
      'A2': 'Larger motorcycles (categories B and C)',
      'B': 'Cars ≤ 3.5 tons, up to 8 passenger seats',
      'C1': 'Trucks 3.5–19 tons',
      'C2': 'Heavy trucks >19 tons',
      'D': 'Passenger transport vehicles >3.5 tons or >8 passengers'
    };
    return descriptions[category] || category;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
      
      <div className="border-t border-b border-gray-200 py-4">
        <div className="grid grid-cols-2 gap-8">
          {/* Row 1 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Full Name</div>
            <div className="font-semibold text-gray-900">{candidate.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Age</div>
            <div className="font-semibold text-gray-900">{candidate.age} years old</div>
          </div>

          {/* Row 2 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Phone Number</div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {candidate.phone}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {candidate.email}
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">License Category</div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              {getLicenseDescription(candidate.licenseCategory)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Registration Date</div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {candidate.registrationDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
