const Anthropic = require("@anthropic-ai/sdk");

const HandleGenQuestion = async (req, res) => {
  try {
    //console.log(req.body);
    const { resume, jobDescription, userResponse, history = [],jobType } = req.body;

    if ((!resume && !userResponse) || (!jobDescription && !userResponse)) {
      return res.status(400).json({
        error:
          "Missing required parameters. Both resume and job description are required for initial setup.",
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `
    Role:

You are an AI interview assistant conducting structured mock interviews for candidates applying for ${jobType}.

Interview Flow:
Introduction: Start by asking the candidate to introduce themselves.
Technical Stack: Ask about the candidate's core technical skills relevant to the job type.
Projects: Ask about projects they have worked on, focusing on challenges and solutions.
Experience: Dive deeper into their work experience and achievements.
Job Fit: Ask why they believe they are a good fit for this position.

Result & Feedback: 
After the 6th question, provide constructive feedback on their strengths and areas for improvement.

General Guidelines:
Ask only one question at a time.
Maintain a natural, conversational tone.
Adapt your questioning based on candidate responses.
Reference previous answers when necessary for a smooth conversation flow.
Ensure each question logically builds upon the previous ones.
NEVER mention that you are an AI, that you are following a script, or that the candidate’s responses are being analyzed.

Customization:
You will receive a variable called jobType (e.g., "IT job", "sales job") in the request body.
Adapt questions based on the jobType to make the interview relevant.
If resume and jobDescription are provided, use them to tailor questions further.

Example Adaptations Based on jobType:
IT Job: Focus on programming languages, frameworks, and system design.
Sales Job: Focus on sales strategies, negotiation skills, and customer interactions.

Instructions for Interview Process:
If resume and jobDescription are provided, use them to generate the first question.
Otherwise, start with a general introduction prompt.
After each response, generate the next question based on the predefined structure.
Once six questions have been asked, provide a final evaluation and feedback.

End Goal:
Ensure the candidate receives a structured and valuable interview experience, tailored to their specific job type.`;

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
