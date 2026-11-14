import { callGeminiStructured } from '../services/ai.service.js';

export const SYSTEM_ATTENDANCE_INTEL_PROMPT = `You are CampusFlow's Attendance Intelligence Agent.
Your duty is to monitor attendance patterns, calculate attendance risk percentages, detect students falling below the mandatory 75% threshold, and recommend personalized corrective actions.
You must never accuse students of misconduct; focus strictly on factual attendance compliance and recovery trajectories.`;

export async function runAttendanceIntelligenceAgent({ student, attendanceRecords, totalSessionsHeld }) {
  const attendedCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'verified_recovery').length;
  const currentPercentage = totalSessionsHeld > 0 ? ((attendedCount / totalSessionsHeld) * 100).toFixed(1) : '100.0';
  const numericPct = parseFloat(currentPercentage);
  const isAtRisk = numericPct < 75.0;
  const sessionsNeededFor75 = Math.max(0, Math.ceil((0.75 * totalSessionsHeld - attendedCount) / 0.25));

  const prompt = `Student: ${student.name} (${student.reg_number || '21BCE1042'})
Attended: ${attendedCount} / ${totalSessionsHeld} sessions (${currentPercentage}%)
Institutional Threshold: 75.0%
At Risk Status: ${isAtRisk ? 'CRITICAL - BELOW THRESHOLD' : 'COMPLIANT - ABOVE THRESHOLD'}
Consecutive Sessions Needed: ${sessionsNeededFor75}

Analyze the trajectory and return JSON:
{
  "attendancePercentage": ${numericPct},
  "riskLevel": "${isAtRisk ? (numericPct < 65 ? 'high' : 'medium') : 'low'}",
  "warningMessage": "Clear notification message for student",
  "facultyRecommendation": "Advisory recommendation for course faculty",
  "recommendedAction": "Actionable next step",
  "recoveryPlan": "Step-by-step advice to restore 75%+"
}`;

  const result = await callGeminiStructured({
    systemInstruction: SYSTEM_ATTENDANCE_INTEL_PROMPT,
    prompt,
    timeoutMs: 10000
  });

  if (result && result.warningMessage) {
    return result;
  }

  // Deterministic calculation
  return {
    attendancePercentage: numericPct,
    riskLevel: isAtRisk ? (numericPct < 65 ? 'high' : 'medium') : 'low',
    warningMessage: isAtRisk
      ? `Alert: Your attendance is currently at ${numericPct}%, which is below the mandatory 75% threshold. You must attend the next ${sessionsNeededFor75} consecutive sessions to regain exam eligibility.`
      : `Your attendance is in good standing at ${numericPct}%. Keep maintaining regular check-ins.`,
    facultyRecommendation: isAtRisk
      ? `Student requires academic counseling and notification regarding low attendance before mid-semester examinations.`
      : `No immediate intervention required. Student consistently meets threshold requirements.`,
    recommendedAction: isAtRisk ? 'Schedule Student Counseling' : 'Maintain Active Monitoring',
    recoveryPlan: isAtRisk
      ? `Attend all upcoming lecture sessions without absence. File recovery requests immediately if hardware/network issues occur during QR scans.`
      : `Continue standard class check-ins.`
  };
}

