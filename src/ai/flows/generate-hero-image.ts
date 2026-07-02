'use server';

/**
 * @fileOverview Generates a hero image from a text prompt.
 *
 * - generateHeroImage - A function that generates the hero image.
 * - GenerateHeroImageInput - The input type for the generateHeroImage function.
 * - GenerateHeroImageOutput - The return type for the generateHeroImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeroImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateHeroImageInput = z.infer<typeof GenerateHeroImageInputSchema>;

const GenerateHeroImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateHeroImageOutput = z.infer<typeof GenerateHeroImageOutputSchema>;

export async function generateHeroImage(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  return generateHeroImageFlow(input);
}

const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {imageDataUri: media.url};
  }
);
