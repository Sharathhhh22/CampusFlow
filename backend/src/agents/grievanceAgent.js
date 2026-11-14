import { callGeminiStructured, sanitizePromptInput } from '../services/ai.service.js';

export const SYSTEM_GRIEVANCE_PROMPT = `You are CampusFlow's Grievance Management Agent.
Your responsibility is to analyze student grievances, categorize them accurately, assign appropriate priority levels, route them to the correct institutional department, and ensure transparent escalation tracking.`;

export async function runGrievanceAgent({ title, description, student }) {
  const sanitizedTitle = sanitizePromptInput(title);
  const sanitizedDesc = sanitizePromptInput(description);

  const prompt = `Student: ${student.name} (${student.reg_number || '21BCE1042'})
Complaint Title: "${sanitizedTitle}"
Complaint Details: "${sanitizedDesc}"

Analyze the grievance and return JSON:
{
  "category": "academic" | "facilities" | "harassment" | "canteen" | "hostel" | "other",
  "priority": "low" | "medium" | "high" | "urgent",
  "assignedDepartment": "Responsible Department Name",
  "recommendedAction": "Immediate administrative response step",
  "estimatedResolutionHours": number,
  "summaryForAdmin": "Executive summary for dean/administrator",
  "acknowledgmentMessage": "Empathetic acknowledgment message for student"
}`;

  const result = await callGeminiStructured({
    systemInstruction: SYSTEM_GRIEVANCE_PROMPT,
    prompt,
    timeoutMs: 10000
  });

  if (result && result.assignedDepartment) {
    return result;
  }

  // Deterministic fallback
  const text = (sanitizedTitle + ' ' + sanitizedDesc).toLowerCase();
  let category = 'facilities';
  let assignedDept = 'Campus Infrastructure & Facilities';
  let priority = 'medium';

  if (text.includes('exam') || text.includes('grade') || text.includes('faculty') || text.includes('professor') || text.includes('class')) {
    category = 'academic';
    assignedDept = 'Office of Academic Affairs & Dean of Engineering';
    priority = 'medium';
  } else if (text.includes('urgent') || text.includes('harass') || text.includes('safety') || text.includes('threat')) {
    category = 'harassment';
    assignedDept = 'Campus Grievance & Student Welfare Committee';
    priority = 'urgent';
  } else if (text.includes('hostel') || text.includes('room') || text.includes('water') || text.includes('electricity')) {
    category = 'hostel';
    assignedDept = 'Hostel & Residential Administration';
  }

  return {
    category,
    priority,
    assignedDepartment: assignedDept,
    recommendedAction: `Forward ticket to ${assignedDept} with 48-hour SLA for initial inspection.`,
    estimatedResolutionHours: priority === 'urgent' ? 6 : 48,
    summaryForAdmin: `Student filed a ${priority}-priority ${category} ticket regarding: "${sanitizedTitle}". Automatic department assignment: ${assignedDept}.`,
    acknowledgmentMessage: `Your grievance has been logged under ticket tracking. It has been routed directly to ${assignedDept} with expected review within 24-48 hours.`
  };
}

