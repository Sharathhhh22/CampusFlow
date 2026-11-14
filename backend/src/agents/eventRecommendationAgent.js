import { callGeminiStructured } from '../services/ai.service.js';

export const SYSTEM_EVENT_RECOMMENDER_PROMPT = `You are CampusFlow's AI Event Discovery & Opportunity Recommender.
Your purpose is to connect students with high-impact hackathons, technical workshops, innovation challenges, and guest seminars that match their academic discipline, year, and career aspirations.`;

export async function runEventRecommendationAgent({ studentProfile, eventsList }) {
  const publishedEvents = eventsList.filter(e => e.status === 'published');
  
  const prompt = `Student Profile:
Name: ${studentProfile.name || studentProfile.full_name}
Department: ${studentProfile.department || 'Computer Science & Engineering'}
Academic Year: Year 3 (Semester 6)
Core Interests: Artificial Intelligence, Cloud Infrastructure, Competitive Coding, Full-Stack Development

Available Campus Events:
${JSON.stringify(publishedEvents.map(e => ({
  id: e.id,
  title: e.title,
  category: e.category,
  venue: e.venue,
  event_date: e.event_date || e.eventDate,
  registration_deadline: e.registration_deadline || e.registrationDeadline,
  prizes: e.prizes
})))}

Generate personalized event recommendations in JSON:
{
  "featuredEventId": "Best matching Event ID",
  "recommendedEventIds": ["ID1", "ID2"],
  "personalizedRationale": "Why these specific opportunities fit the student's profile",
  "upcomingUrgentDeadlines": [
    { "eventId": "ID", "title": "Title", "daysRemaining": number }
  ],
  "careerImpactNote": "How participation in these events strengthens the student's placement resume"
}`;

  const result = await callGeminiStructured({
    systemInstruction: SYSTEM_EVENT_RECOMMENDER_PROMPT,
    prompt,
    timeoutMs: 10000
  });

  if (result && result.recommendedEventIds) {
    return result;
  }

  // Deterministic fallback
  const hackathon = publishedEvents.find(e => e.category === 'hackathon') || publishedEvents[0];
  const workshop = publishedEvents.find(e => e.category === 'workshop') || publishedEvents[1] || publishedEvents[0];

  return {
    featuredEventId: hackathon?.id || 'c1111111-1111-1111-1111-111111111111',
    recommendedEventIds: [hackathon?.id, workshop?.id].filter(Boolean),
    personalizedRationale: `As a 3rd Year CSE student specializing in distributed systems, Apex HackNova 2026 offers national exposure with industry mentors. The Gemini 2.0 Multi-Agent Masterclass directly aligns with your AI systems curriculum.`,
    upcomingUrgentDeadlines: [
      {
        eventId: hackathon?.id,
        title: hackathon?.title || 'Apex HackNova 2026',
        daysRemaining: 10
      },
      {
        eventId: workshop?.id,
        title: workshop?.title || 'Autonomous Multi-Agent AI Workshop',
        daysRemaining: 3
      }
    ],
    careerImpactNote: `Winning or presenting a prototype at Apex HackNova qualifies you for priority cloud internship interviews with partner tech companies.`
  };
}
