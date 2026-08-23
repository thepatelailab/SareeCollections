'use server';

/**
 * @fileOverview Generates a lifestyle background for handcrafted products (like crochet) while preserving the original item.
 *
 * - generateCrochetLifestyle - A function that handles lifestyle image generation.
 * - GenerateCrochetLifestyleInput - The input type for the function.
 * - GenerateCrochetLifestyleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCrochetLifestyleInputSchema = z.object({
  productPhotoDataUri: z
    .string()
    .describe(
      "A photo of the original handcrafted crochet product, as a data URI."
    ),
  backgroundDescription: z
    .string()
    .describe("A description of the desired luxury background or lifestyle setting."),
});
export type GenerateCrochetLifestyleInput = z.infer<typeof GenerateCrochetLifestyleInputSchema>;

const GenerateCrochetLifestyleOutputSchema = z.object({
  lifestyleImageDataUri: z
    .string()
    .describe('The generated image with the original product in a new lifestyle background, as a data URI.'),
});
export type GenerateCrochetLifestyleOutput = z.infer<typeof GenerateCrochetLifestyleOutputSchema>;

export async function generateCrochetLifestyle(input: GenerateCrochetLifestyleInput): Promise<GenerateCrochetLifestyleOutput> {
  return generateCrochetLifestyleFlow(input);
}

const generateCrochetLifestyleFlow = ai.defineFlow(
  {
    name: 'generateCrochetLifestyleFlow',
    inputSchema: GenerateCrochetLifestyleInputSchema,
    outputSchema: GenerateCrochetLifestyleOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.productPhotoDataUri } },
        { text: `You are a professional luxury commercial photographer specializing in handcrafted textiles and crochet work.

        CORE REQUIREMENT: SUBJECT PRESERVATION.
        1. Identify the handcrafted crochet product in the reference image.
        2. DO NOT ALTER THE PRODUCT: The shape, color, stitch pattern, and texture of the crochet item must remain 100% original.
        3. RE-CONTEXTUALIZE: Extract the original item and place it into a new, elegant lifestyle environment described as: "${input.backgroundDescription}".
        4. LIGHTING & SHADOWS: The lighting in the new scene must match the original product's lighting. Generate accurate contact shadows so the item looks naturally placed on the new surface.
        5. STYLE: The output should be a high-resolution, high-end catalog photo suitable for an elite boutique.` },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No lifestyle image was generated.');
    }

    return {lifestyleImageDataUri: media.url};
  }
);
