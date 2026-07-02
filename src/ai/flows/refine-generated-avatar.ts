'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining AI-generated Saree Dukans.
 *
 * refineGeneratedAvatar - A function that takes an initial Saree Dukan image and a refinement prompt, and returns a refined image.
 * RefineGeneratedAvatarInput - The input type for the refineGeneratedAvatar function.
 * RefineGeneratedAvatarOutput - The return type for the refineGeneratedAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineGeneratedAvatarInputSchema = z.object({
  initialImage: z
    .string()
    .describe(
      'The initial AI-generated image of the Saree Dukan, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  refinementPrompt: z
    .string()
    .describe('A text prompt describing the desired refinements to the image.'),
});
export type RefineGeneratedAvatarInput = z.infer<typeof RefineGeneratedAvatarInputSchema>;

const RefineGeneratedAvatarOutputSchema = z.object({
  refinedImage: z
    .string()
    .describe(
      'The refined AI-generated image of the Saree Dukan, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type RefineGeneratedAvatarOutput = z.infer<typeof RefineGeneratedAvatarOutputSchema>;

export async function refineGeneratedAvatar(
  input: RefineGeneratedAvatarInput
): Promise<RefineGeneratedAvatarOutput> {
  return refineGeneratedAvatarFlow(input);
}

const refineGeneratedAvatarFlow = ai.defineFlow(
  {
    name: 'refineGeneratedAvatarFlow',
    inputSchema: RefineGeneratedAvatarInputSchema,
    outputSchema: RefineGeneratedAvatarOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        {media: {url: input.initialImage}},
        {text: input.refinementPrompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No refined image was generated.');
    }

    return {refinedImage: media.url!};
  }
);
