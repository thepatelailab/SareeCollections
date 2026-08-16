'use server';

/**
 * @fileOverview AI flow for generating luxury social media captions for heritage sarees.
 *
 * - generateSocialCaptions - A function that generates marketing copy for different platforms.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialCaptionInputSchema = z.object({
  productName: z.string().describe('The name of the saree.'),
  variety: z.string().optional().describe('The textile variety (e.g., Banarasi).'),
  description: z.string().optional().describe('A brief description of the product.'),
});
export type GenerateSocialCaptionInput = z.infer<typeof GenerateSocialCaptionInputSchema>;

const GenerateSocialCaptionOutputSchema = z.object({
  instagram: z.string().describe('Instagram caption with emojis and hashtags.'),
  whatsapp: z.string().describe('Short, punchy WhatsApp message for direct sales.'),
  facebook: z.string().describe('Engaging Facebook post highlighting heritage.'),
});
export type GenerateSocialCaptionOutput = z.infer<typeof GenerateSocialCaptionOutputSchema>;

export async function generateSocialCaptions(input: GenerateSocialCaptionInput): Promise<GenerateSocialCaptionOutput> {
  return generateSocialCaptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialCaptionsPrompt',
  input: { schema: GenerateSocialCaptionInputSchema },
  output: { schema: GenerateSocialCaptionOutputSchema },
  prompt: `You are a luxury fashion storyteller for an elite saree boutique. 
  Generate three compelling social media captions for the following saree:
  
  Name: {{{productName}}}
  Variety: {{{variety}}}
  Description: {{{description}}}
  
  Tone: Elegant, culturally rich, celebrating artisan heritage. 
  Instagram should include relevant emojis and hashtags like #SareeDukan #HeritageWeaves.
  WhatsApp should be professional and invite inquiry.
  Facebook should tell a brief story about the craft.`,
});

const generateSocialCaptionsFlow = ai.defineFlow(
  {
    name: 'generateSocialCaptionsFlow',
    inputSchema: GenerateSocialCaptionInputSchema,
    outputSchema: GenerateSocialCaptionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
