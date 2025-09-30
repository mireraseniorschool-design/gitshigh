'use server';

/**
 * @fileOverview A student report generator AI agent.
 *
 * - generateStudentReports - A function that handles the student report generation process.
 * - GenerateStudentReportsInput - The input type for the generateStudentReports function.
 * - GenerateStudentReportsOutput - The return type for the generateStudentReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudentReportsInputSchema = z.object({
  studentData: z
    .string()
    .describe(
      'The data for the student, which contains all fields relevant to generating a report card.'
    ),
  examData: z
    .string()
    .describe(
      'The exam data including student marks per subject, report forms, marksheet to show student performance and rankings etc'
    ),
  templateInstructions: z.string().describe('Instructions for formatting the report.'),
});
export type GenerateStudentReportsInput = z.infer<typeof GenerateStudentReportsInputSchema>;

const GenerateStudentReportsOutputSchema = z.object({
  report: z.string().describe('The generated student report.'),
});
export type GenerateStudentReportsOutput = z.infer<typeof GenerateStudentReportsOutputSchema>;

export async function generateStudentReports(input: GenerateStudentReportsInput): Promise<GenerateStudentReportsOutput> {
  return generateStudentReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentReportsPrompt',
  input: {schema: GenerateStudentReportsInputSchema},
  output: {schema: GenerateStudentReportsOutputSchema},
  prompt: `You are an expert report generator for schools.

You will use the student and exam information provided to generate a report, and adhere to the template instructions.

Student Data: {{{studentData}}}
Exam Data: {{{examData}}}
Template Instructions: {{{templateInstructions}}}

Generate the student report.`,
});

const generateStudentReportsFlow = ai.defineFlow(
  {
    name: 'generateStudentReportsFlow',
    inputSchema: GenerateStudentReportsInputSchema,
    outputSchema: GenerateStudentReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
