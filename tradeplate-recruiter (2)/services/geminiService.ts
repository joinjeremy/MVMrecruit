import { GoogleGenAI, Type } from "@google/genai";
import { Candidate } from "../types";

const parseCandidateEmail = async (emailText: string): Promise<Partial<Candidate>> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert recruitment assistant for Simply Driven Logistics (MVM/SDL), a vehicle logistics company.
    Extract candidate information from the unstructured email text provided below.

    Context:
    - Drivers are self-employed subcontractors.
    - Key requirements: Off-road parking, No license points, Financial stability (funding for first 2-4 weeks).
    - Email format often ends with "Name's contact details:".
    
    Tasks:
    1. Extract basic details (Name, Email, Mobile, Location, Age).
    2. Extract specific logistics requirements: Parking Status (Off-road is preferred), License Points.
    3. Analyze Financial Status: Can they fund themselves until the first pay run (1st or 16th)?
    4. Look for any compliance data if present: NI Number, Driving License Number.
    
    Email Text:
    """
    ${emailText}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            mobile: { type: Type.STRING },
            age: { type: Type.NUMBER },
            location: { type: Type.STRING },
            parkingStatus: { type: Type.STRING, description: "e.g. Off-road, Driveway, Street" },
            licensePoints: { type: Type.STRING },
            experienceSummary: { type: Type.STRING },
            availability: { type: Type.STRING },
            financialStatus: { type: Type.STRING, description: "Crucial: summarize ability to fund initial weeks" },
            notes: { type: Type.STRING, description: "General summary" },
            rating: { type: Type.INTEGER, description: "Estimated rating 1-5 based on tone" },
            // Extra compliance fields if found
            niNumber: { type: Type.STRING, nullable: true },
            drivingLicenseNumber: { type: Type.STRING, nullable: true }
          },
          required: ["name", "experienceSummary", "location"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as Partial<Candidate>;
    }
    throw new Error("No text returned from model");

  } catch (error) {
    console.error("Error parsing candidate with Gemini:", error);
    throw error;
  }
};

export { parseCandidateEmail };