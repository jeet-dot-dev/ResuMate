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

    const systemPrompt = `You are a professional interviewer conducting a mock technical interview. Follow these rules:
1. Ask questions based on the candidate's resume
2. Acknowledge previous answers before asking new questions
3. Keep questions technical and focused on real-world scenarios
4. After 5 questions, conclude the interview
5. Never reveal you're an AI or mention the resume directly`;

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
