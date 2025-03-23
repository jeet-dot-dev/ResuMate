

const Anthropic = require("@anthropic-ai/sdk");

const HandleGenQuestion = async (req, res) => {
  try {
    const { resume, jobDescription, userResponse, history = [], questionCount = 0, jobType = "technical position" } = req.body;
    
    if ((!resume && !userResponse) || (!jobDescription && !userResponse)) {
      return res.status(400).json({
        error: "Missing required parameters. Both resume and job description are required for initial setup.",
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Get the appropriate system prompt based on question count
    const systemPrompt = getSystemPrompt(questionCount, jobType);

    const messages = [];

    // Different handling based on question count
    if (questionCount === 0) {
      // Initial setup - asking first introduction question
      messages.push({
        role: "user",
        content: `This is the candidate's resume: \n ${resume.substring(0, 9000)}\n\n
                  This is the job description they're applying for: \n ${jobDescription.substring(0, 9000)}\n\n
                  Ask them to introduce themselves in a professional, friendly manner.`,
      });
    } else if (questionCount >= 1 && questionCount <= 3) {
      // Resume-based questions (include history for context)
      messages.push({
        role: "user",
        content: `Resume: \n ${resume.substring(0, 9000)}\n\n
                  Please review the following interview history and ask the next question (question #${questionCount}) 
                  based on the candidate's resume. Do not repeat previous questions.`,
      });
      
      // Add conversation history
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "interviewer" ? "assistant" : "user",
        content: msg.content,
      }));
      
      messages.push(...formattedHistory);
      
      // Add the latest user response if provided
      if (userResponse) {
        messages.push({ role: "user", content: userResponse });
      }
    } else if (questionCount >= 4 && questionCount <= 7) {
      // Job description-based questions (do NOT include history to avoid confusion)
      messages.push({
        role: "user",
        content: `Job Description: \n ${jobDescription.substring(0, 9000)}\n\n
                  This is question #${questionCount} of the interview.
                  Ask a question about the job requirements. Focus on skills, responsibilities, or experiences 
                  specifically mentioned in the job description.`,
      });
      
      // Only add the latest user response
      if (userResponse) {
        messages.push({ role: "user", content: userResponse });
      }
    } else {
      // Final assessment (include entire history for analysis)
      messages.push({
        role: "user",
        content: `Resume: \n ${resume.substring(0, 9000)}\n\n
                  Job Description: \n ${jobDescription.substring(0, 9000)}\n\n
                  Interview History: \n ${JSON.stringify(history)}\n\n
                  This is question #${questionCount} of the interview.
                  ${questionCount === 10 ? "Provide a final assessment of the candidate based on the full interview." : 
                  "Ask the candidate about their questions or career goals."}`
    });
      
      // Add conversation history for final assessment
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "interviewer" ? "assistant" : "user",
        content: msg.content,
      }));
      
      messages.push(...formattedHistory);
      
      // Add the latest user response if provided
      if (userResponse) {
        messages.push({ role: "user", content: userResponse });
      }
    }

    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000, // Increased for final assessment
      system: systemPrompt,
      messages: messages,
    });

    res.json({
      message: claudeResponse.content[0].text,
      questionCount: questionCount
    });
  } catch (err) {
    console.error("Interview error:", err.message);
    res.status(500).json({
      error: err.message,
    });
  }
};

// System prompt selection function
const getSystemPrompt = (questionCount, jobType) => {
  // Introduction (Question 0)
  if (questionCount === 0) {
    return `
Role:
You are an AI interview assistant conducting a structured mock interview for a ${jobType} position.

Current Stage: INTRODUCTION
Question Count: 0 of 10

Instructions:
1. Start by asking the candidate to introduce themselves.
2. Ask ONLY this first introduction question.
3. Your question should be warm, professional, and brief.
4. DO NOT provide any answers or feedback at this stage.
5. DO NOT mention that you are an AI or that you're following instructions.
6. NEVER generate both a question and answer in the same response.

Example Question Format:
"Hello! I'm conducting your mock interview for the ${jobType} role today. Could you please introduce yourself and tell me a bit about your background?"
`;
  }
  
  // Resume-Based Questions (Questions 1-3)
  else if (questionCount >= 1 && questionCount <= 3) {
    return `
Role:
You are an AI interview assistant conducting a structured mock interview for a ${jobType} position.

Current Stage: RESUME EXPLORATION
Question Count: ${questionCount} of 10

Instructions:
1. Review the candidate's resume and previous chat history carefully.
2. Ask ONE question at a time based SPECIFICALLY on the candidate's resume.
3. Focus on the following areas in sequence:
   - Question 1: Technical skills relevant to the ${jobType} position
   - Question 2: Most relevant project or experience from their resume
   - Question 3: Challenging situation from their work history and how they handled it
4. Reference specific details from their resume to show you've reviewed it.
5. Each question must be unique and not repeat any previous questions.
6. DO NOT provide answers or speak for the candidate.
7. NEVER generate both a question and answer in the same response.
8. Keep your questions concise and professional.

Example Question Format:
"I see from your resume that you have experience with [specific skill/tool/project]. Could you elaborate on how you've applied this in your previous role at [company mentioned in resume]?"
`;
  }
  
  // Job Description-Based Questions (Questions 4-7)
  else if (questionCount >= 4 && questionCount <= 7) {
    return `
Role:
You are an AI interview assistant conducting a structured mock interview for a ${jobType} position.

Current Stage: JOB FIT ASSESSMENT
Question Count: ${questionCount} of 10

Instructions:
1. Review ONLY the job description provided.
2. Ask ONE question at a time based SPECIFICALLY on the requirements in the job description.
3. Focus on the following areas in sequence:
   - Question 4: Required technical skills mentioned in the job description
   - Question 5: Specific responsibilities outlined in the job description
   - Question 6: Behavioral scenario related to key job requirements
   - Question 7: Candidate's interest and understanding of the role/company
4. DO NOT reference the previous questions or answers.
5. Ask fresh questions directly related to the job requirements.
6. DO NOT provide answers or speak for the candidate.
7. NEVER generate both a question and answer in the same response.
8. Keep your questions concise and professional.

Example Question Format:
"The job description emphasizes the need for [specific skill/requirement]. Can you describe your experience with this and how you would apply it in this role?"
`;
  }
  
  // Final Assessment (Questions 8-10)
  else {
    return `
Role:
You are an AI interview assistant conducting a structured mock interview for a ${jobType} position.

Current Stage: FINAL ASSESSMENT
Question Count: ${questionCount} of 10

Instructions:
1. Review ALL previous questions and answers from the interview.
2. For questions 8-9:
   - Ask about candidate's questions for the interviewer
   - Inquire about salary expectations or career goals
3. For question 10:
   - Provide a structured assessment of the candidate's interview performance
   - Include 3 specific strengths with examples from their answers
   - Include 2 areas for improvement with constructive suggestions
   - End with encouragement and next steps
4. Base your assessment ONLY on the actual interview responses.
5. Be fair, constructive, and specific in your feedback.
6. For the final report, structure it clearly with sections for strengths and areas for improvement.

Example Final Assessment Format:
"Based on our interview today, I'd like to provide some feedback:

Strengths:
1. [Specific strength with example from their answers]
2. [Specific strength with example from their answers]
3. [Specific strength with example from their answers]

Areas for Improvement:
1. [Specific area with constructive suggestion]
2. [Specific area with constructive suggestion]

Overall, [brief summary of performance]. If this were a real interview for the ${jobType}, the next steps would be [appropriate next steps]."
`;
  }
};

module.exports = HandleGenQuestion;