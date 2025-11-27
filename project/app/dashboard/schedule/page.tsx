import { ScheduleComponent } from "@/components/schedule/Scheddule"; 
import { mockCandidates } from "@/lib/mockData";

export default function SchedulePage() {
  // Example: show the first candidate
  const candidate = mockCandidates[0];

  return <ScheduleComponent candidate={candidate} />;
}
