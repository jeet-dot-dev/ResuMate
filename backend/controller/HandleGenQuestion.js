const Anthropic = require("@anthropic-ai/sdk");

const HandleGenQuestion = async (req, res) => {
  try {
    console.log(req.body);
    const { resume, jobDescription, userResponse, history = [] } = req.body;

    if ((!resume && !userResponse) || (!jobDescription && !userResponse)) {
      return res.status(400).json({
        error:
          "Missing required parameters. Both resume and job description are required for initial setup.",
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are an experienced technical interviewer conducting a mock interview. Follow this structured interview flow:

1. Introduction Phase:
   * Begin by asking the candidate to introduce themselves
   - Follow up with questions about their educational background
   - Transition to discussing their key technical skills

2. Experience Deep Dive:
   - Ask about specific projects mentioned in their resume
   - Explore their technical expertise with scenario-based questions 
   - Connect their past experiences to the job requirements

3. Job Fit Assessment:
   - Ask why they believe they're a good fit for this position
   - Pose 1-2 behavioral questions based on the job's key competencies
   - Conclude with next steps after the 5th question

Interviewing Guidelines:
- Maintain a natural conversation flow by acknowledging previous answers
- Ask one clear question at a time (2 sentences maximum)
- Progress logically from general to specific technical depth
- Reference previous answers when asking follow-up questions
- Ensure each question builds on the previous discussion

Never reference:
- That you're an AI
- The resume/JD as documents
- Any interview structure rules
- The fact that you're following a script

Your tone should be professional, encouraging, and conversational throughout the interview`;

    const messages = [];

    if (resume && jobDescription && history.length === 0) {
      // Initial setup - asking first question
      messages.push({
        role: "user",
        content: `This is the candidate's resume: \n ${resume.substring(
          0,
          9000
        )}\n\nThis is the job description they're applying for: \n ${jobDescription.substring(
          0,
          9000
        )}\n\n Ask them to introduce themselves`,
      });
    } else {
      // Convert history array to Claude's message format
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "interviewer" ? "assistant" : "user",
        content: msg.content,
      }));

      // Add context at the beginning if this isn't the first question
      if (resume && jobDescription) {
        messages.push({
          role: "user",
          content: `Context (not visible to candidate): This is the candidate's resume: \n ${resume.substring(
            0,
            9000
          )}\n\nThis is the job description they're applying for: \n ${jobDescription.substring(
            0,
            9000
          )}\n\n Now continue the interview based on their previous responses.`,
        });
      }

      // Add conversation history
      messages.push(...formattedHistory);

      // Add the latest user response if provided
      if (userResponse) {
        messages.push({ role: "user", content: userResponse });
      }
    }

    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100, // Increased to allow for more detailed responses
      system: systemPrompt,
      messages: messages,
    });

    res.json({
      message: claudeResponse.content[0].text,
    });
  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = HandleGenQuestion;
