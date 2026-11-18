import { NextRequest, NextResponse } from 'next/server';

export interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
  aiAnalysis: {
    sentiment: 'GOOD' | 'BAD' | 'NEUTRAL';
    confidence: number;
    tone: string;
    keyPoints: string[];
    modelUsed: string;
  };
  automatedResponse: {
    type: 'THANK_YOU' | 'SORRY_APOLOGY' | 'INQUIRY_HELP';
    subject: string;
    message: string;
    actionTaken: string;
    couponOrTicketCode?: string;
    sentAt: string;
  };
}

// In-memory store for feedback history
const globalFeedbacks: FeedbackEntry[] = [
  {
    id: 'fb_demo_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    rating: 5,
    comment: 'The product quality is absolutely mind-blowing! Super fast delivery and the user interface is so clean.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    aiAnalysis: {
      sentiment: 'GOOD',
      confidence: 0.98,
      tone: 'Delighted & Appreciative',
      keyPoints: ['Exceptional quality', 'Fast delivery', 'Clean UI'],
      modelUsed: 'gemini-1.5-flash'
    },
    automatedResponse: {
      type: 'THANK_YOU',
      subject: 'Thank you for your wonderful review, Aarav! 🎉',
      message: 'Dear Aarav, thank you so much for taking the time to share your feedback! We are thrilled that you loved the product quality and fast delivery. As a token of our gratitude, here is a 20% discount code for your next order: BLESSING20.',
      actionTaken: 'Sent Thank You Email + Added 20% Promo Voucher',
      couponOrTicketCode: 'BLESSING20',
      sentAt: new Date(Date.now() - 3600000 * 2 + 500).toISOString()
    }
  },
  {
    id: 'fb_demo_2',
    name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    rating: 1,
    comment: 'Very bad experience. The packaging was torn and the product stopped working within 2 hours. Very disappointed!',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    aiAnalysis: {
      sentiment: 'BAD',
      confidence: 0.97,
      tone: 'Frustrated & Disappointed',
      keyPoints: ['Torn packaging', 'Defective unit', 'Rapid failure'],
      modelUsed: 'gemini-1.5-flash'
    },
    automatedResponse: {
      type: 'SORRY_APOLOGY',
      subject: 'We are deeply sorry for the defective item, Rohan - Support Ticket #BLS-1049 Created',
      message: 'Dear Rohan, we sincerely apologize for the broken packaging and defective unit. This falls far short of our standards. We have automatically created Priority Support Ticket #BLS-1049 and our senior representative will reach out within 2 hours to arrange a free doorstep replacement or instant full refund.',
      actionTaken: 'Created Urgent Support Ticket #BLS-1049 + Triggered Replacement Protocol',
      couponOrTicketCode: 'TICKET-BLS-1049',
      sentAt: new Date(Date.now() - 3600000 * 5 + 600).toISOString()
    }
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    feedbacks: globalFeedbacks,
    totalCount: globalFeedbacks.length,
    goodCount: globalFeedbacks.filter(f => f.aiAnalysis.sentiment === 'GOOD').length,
    badCount: globalFeedbacks.filter(f => f.aiAnalysis.sentiment === 'BAD').length
  });
}

export async function DELETE() {
  globalFeedbacks.length = 0;
  return NextResponse.json({
    success: true,
    message: 'All feedback database records have been completely cleared.',
    feedbacks: [],
    totalCount: 0,
    goodCount: 0,
    badCount: 0
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, rating = 5, comment } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment / feedback cannot be empty' },
        { status: 400 }
      );
    }

    const userName = name?.trim() || 'Valued Customer';
    const userEmail = email?.trim() || 'customer@example.com';
    const numRating = Number(rating) || 5;

    // AI Sentiment Analysis Engine
    const { sentiment, confidence, tone, keyPoints, modelUsed } = await analyzeSentimentWithAI(comment, numRating);

    // Automated Decision & Message Generation
    let automatedResponse: FeedbackEntry['automatedResponse'];

    if (sentiment === 'GOOD') {
      const code = `THANKYOU${Math.floor(1000 + Math.random() * 9000)}`;
      automatedResponse = {
        type: 'THANK_YOU',
        subject: `Thank you so much for your kind words, ${userName}! 🎉`,
        message: `Dear ${userName},\n\nThank you so much for sharing your positive experience with us! It means the world to our team to know that you are happy with our service.\n\nAs a heartfelt thank you, we have credited your account with an exclusive 25% discount voucher: ${code}.\n\nWe look forward to serving you again!\n\nWarmest regards,\nThe Customer Success Team`,
        actionTaken: 'Dispatched Automated Thank You Email + Issued 25% VIP Voucher',
        couponOrTicketCode: code,
        sentAt: new Date().toISOString()
      };
    } else if (sentiment === 'BAD') {
      const ticketId = `BLS-${Math.floor(1000 + Math.random() * 9000)}`;
      automatedResponse = {
        type: 'SORRY_APOLOGY',
        subject: `We are truly sorry about your experience, ${userName} - Support Ticket #${ticketId} Created`,
        message: `Dear ${userName},\n\nWe sincerely apologize for the trouble and frustration you experienced. This is certainly not the standard of quality we promise to deliver.\n\nOur system has automatically logged your complaint under Priority Escalation Ticket #${ticketId}. Our Customer Care Lead has been alerted and will personally assist you with a direct resolution, replacement, or immediate full refund.\n\nThank you for bringing this to our attention—we are committed to making things right.\n\nWith sincere apologies,\nSenior Operations Support`,
        actionTaken: `Automated Apology Sent + Priority Ticket #${ticketId} Opened in Support Desk`,
        couponOrTicketCode: ticketId,
        sentAt: new Date().toISOString()
      };
    } else {
      automatedResponse = {
        type: 'INQUIRY_HELP',
        subject: `Thank you for reaching out, ${userName}!`,
        message: `Dear ${userName},\n\nThank you for reaching out with your thoughts. We have noted your points and our helpdesk team is on standby to assist with any questions you might have.\n\nBest regards,\nBlessing Team`,
        actionTaken: 'Logged Feedback & Sent Helpdesk Acknowledgment',
        sentAt: new Date().toISOString()
      };
    }

    const newEntry: FeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userName,
      email: userEmail,
      rating: numRating,
      comment,
      createdAt: new Date().toISOString(),
      aiAnalysis: {
        sentiment,
        confidence,
        tone,
        keyPoints,
        modelUsed
      },
      automatedResponse
    };

    // Store in history (newest first)
    globalFeedbacks.unshift(newEntry);

    return NextResponse.json({
      success: true,
      feedback: newEntry,
      message: `AI analyzed comment as ${sentiment} feedback. Automated ${automatedResponse.type} response generated and dispatched!`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent AI Analysis function
 * Uses Gemini API if GEMINI_API_KEY is present, or built-in semantic heuristic reasoning
 */
async function analyzeSentimentWithAI(
  text: string,
  rating: number
): Promise<{
  sentiment: 'GOOD' | 'BAD' | 'NEUTRAL';
  confidence: number;
  tone: string;
  keyPoints: string[];
  modelUsed: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Analyze this customer feedback comment:
"${text}"
Star rating given: ${rating} out of 5.

Classify as either "GOOD", "BAD", or "NEUTRAL".
Return ONLY a valid JSON object with keys:
- sentiment: "GOOD" | "BAD" | "NEUTRAL"
- confidence: number between 0.85 and 0.99
- tone: brief description (e.g. "Delighted", "Frustrated", "Satisfied", "Angry")
- keyPoints: array of 2-3 short phrases summarizing reasons`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          sentiment: parsed.sentiment || (rating >= 4 ? 'GOOD' : 'BAD'),
          confidence: Number(parsed.confidence) || 0.96,
          tone: parsed.tone || (rating >= 4 ? 'Positive' : 'Critical'),
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['User feedback processed'],
          modelUsed: 'Google Gemini 1.5 Flash'
        };
      }
    } catch {
      // Fall through to semantic engine
    }
  }

  // Built-in Semantic AI Engine
  const lower = text.toLowerCase();
  const badWords = [
    'bad', 'worst', 'terrible', 'horrible', 'poor', 'hate', 'waste', 'broken', 
    'damaged', 'defect', 'refund', 'cheat', 'slow', 'stopped', 'failed', 'useless',
    'disappointed', 'disappointing', 'rude', 'delay', 'issue', 'problem', 'angry',
    'bakwaas', 'kharab', 'ganda', 'bekar', 'fraud', 'faltu', 'chutiya', 'loot'
  ];

  const goodWords = [
    'good', 'great', 'awesome', 'amazing', 'love', 'excellent', 'fantastic', 
    'best', 'super', 'happy', 'fast', 'helpful', 'wonderful', 'perfect', 
    'satisfied', 'impressed', 'clean', 'brilliant', 'top', 'badiya', 'shandar',
    'mast', 'achha', 'tagda', 'solid'
  ];

  let badScore = 0;
  let goodScore = 0;

  badWords.forEach(w => {
    if (lower.includes(w)) badScore += 1;
  });

  goodWords.forEach(w => {
    if (lower.includes(w)) goodScore += 1;
  });

  // Factor in the star rating
  if (rating <= 2) badScore += 2;
  if (rating >= 4) goodScore += 2;

  if (badScore > goodScore) {
    return {
      sentiment: 'BAD',
      confidence: Math.min(0.98, 0.88 + badScore * 0.03),
      tone: badScore >= 2 ? 'Frustrated & Critical' : 'Dissatisfied',
      keyPoints: [
        lower.includes('broken') || lower.includes('defect') ? 'Quality / Defect issue' : 'Customer expectation not met',
        lower.includes('slow') || lower.includes('delay') ? 'Delivery or service delay' : 'Dissatisfaction with experience',
        rating <= 2 ? 'Low rating (1-2 stars)' : 'Negative feedback indicators'
      ],
      modelUsed: 'Blessing AI Semantic Engine'
    };
  } else if (goodScore > badScore) {
    return {
      sentiment: 'GOOD',
      confidence: Math.min(0.99, 0.89 + goodScore * 0.03),
      tone: goodScore >= 2 ? 'Delighted & Enthusiastic' : 'Positive & Pleased',
      keyPoints: [
        lower.includes('fast') ? 'Appreciated speed' : 'Satisfied with overall experience',
        lower.includes('clean') || lower.includes('quality') ? 'High product quality' : 'Positive customer sentiment',
        rating >= 4 ? 'High rating (4-5 stars)' : 'Favorable feedback'
      ],
      modelUsed: 'Blessing AI Semantic Engine'
    };
  } else {
    return {
      sentiment: rating >= 4 ? 'GOOD' : rating <= 2 ? 'BAD' : 'NEUTRAL',
      confidence: 0.88,
      tone: 'Neutral / Informational',
      keyPoints: ['General feedback received', `User gave ${rating} star rating`],
      modelUsed: 'Blessing AI Semantic Engine'
    };
  }
}
