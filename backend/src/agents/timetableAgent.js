import { callGeminiStructured } from '../services/ai.service.js';

export const SYSTEM_TIMETABLE_PROMPT = `You are CampusFlow's Smart Timetable & Scheduling Agent.
Your responsibility is to analyze academic schedules, detect room and faculty conflicts, identify replacement slots when a professor is on leave, and propose conflict-free alternative schedules.
Always require administrator approval before making significant schedule adjustments.`;

export async function runTimetableAgent({ unavailableFaculty, affectedClass, existingTimetables, availableRooms, availableFaculty }) {
  const prompt = `Conflict Detected:
Unavailable Faculty: ${unavailableFaculty.name} (${unavailableFaculty.department})
Affected Class: ${affectedClass.name} (${affectedClass.code})
Scheduled Time: Monday 09:00 AM - 10:30 AM
Available Classrooms: ${JSON.stringify(availableRooms)}
Available Substitute Faculty: ${JSON.stringify(availableFaculty)}

Evaluate the conflict and generate an optimal rescheduling proposal in JSON:
{
  "hasConflict": true,
  "issueSummary": "Concise summary of the scheduling disruption",
  "recommendedResolution": {
    "substituteFacultyId": "ID of proposed faculty",
    "substituteFacultyName": "Name",
    "suggestedTimeSlot": "Day and Time",
    "assignedRoomCode": "Room code",
    "rationale": "Why this solution is optimal"
  },
  "requiresAdminApproval": true,
  "affectedStudentsCount": 64
}`;

  const result = await callGeminiStructured({
    systemInstruction: SYSTEM_TIMETABLE_PROMPT,
    prompt,
    timeoutMs: 10000
  });

  if (result && result.issueSummary) {
    return result;
  }

  // Deterministic fallback
  const subFaculty = availableFaculty[0] || { id: 'usr-faculty-02', name: 'Dr. Sarah Jenkins' };
  const room = availableRooms[0] || { code: 'LH-B204', name: 'Smart Lecture Hall B-204' };

  return {
    hasConflict: true,
    issueSummary: `Scheduled faculty ${unavailableFaculty.name} is unavailable for ${affectedClass.name} on Monday 09:00 AM - 10:30 AM.`,
    recommendedResolution: {
      substituteFacultyId: subFaculty.id,
      substituteFacultyName: subFaculty.name,
      suggestedTimeSlot: 'Monday 11:00 AM - 12:30 PM',
      assignedRoomCode: room.code,
      rationale: `Dr. Sarah Jenkins is qualified in algorithms and holds an open teaching window with ${room.name} available without overlap.`
    },
    requiresAdminApproval: true,
    affectedStudentsCount: 64
  };
}
