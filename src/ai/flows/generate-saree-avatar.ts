'use server';

/**
 * @fileOverview Generates an avatar of a model wearing a saree from provided saree components.
 *
 * - generateSareeAvatar - A function that generates the Saree Dukan model preview.
 * - GenerateSareeAvatarInput - The input type for the generateSareeAvatar function.
 * - GenerateSareeAvatarOutput - The return type for the generateSareeAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSareeAvatarInputSchema = z.object({
  sareePhotoDataUri: z
    .string()
    .describe(
      "A photo of the main saree fabric, as a data URI."
    ),
  blousePhotoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the blouse piece or design, as a data URI."
    ),
  detailsPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo showing close-up patterns or specific details, as a data URI."
    ),
});
export type GenerateSareeAvatarInput = z.infer<typeof GenerateSareeAvatarInputSchema>;

const GenerateSareeAvatarOutputSchema = z.object({
  modelWearingSareeDataUri: z
    .string()
    .describe('The generated image of a model wearing the saree components, as a data URI.'),
});
export type GenerateSareeAvatarOutput = z.infer<typeof GenerateSareeAvatarOutputSchema>;

export async function generateSareeAvatar(input: GenerateSareeAvatarInput): Promise<GenerateSareeAvatarOutput> {
  return generateSareeAvatarFlow(input);
}

const generateSareeAvatarFlow = ai.defineFlow(
  {
    name: 'generateSareeAvatarFlow',
    inputSchema: GenerateSareeAvatarInputSchema,
    outputSchema: GenerateSareeAvatarOutputSchema,
  },
  async input => {
    const promptParts: any[] = [
      { text: "You are a professional fashion image generator for an elite saree boutique. You will create a high-quality fashion catalog image of a model wearing a saree synthesized from the provided material references." },
      { media: { url: input.sareePhotoDataUri } }, // Reference 1: Main Fabric
    ];

    let fabricContext = "REFERENCE 1 is the PRIMARY FABRIC for the saree's main body and drape.";

    if (input.blousePhotoDataUri) {
      promptParts.push({ media: { url: input.blousePhotoDataUri } });
      fabricContext += " REFERENCE 2 is the SPECIFIC BLOUSE FABRIC and design to be used for the tailored blouse.";
    }

    if (input.detailsPhotoDataUri) {
      promptParts.push({ media: { url: input.detailsPhotoDataUri } });
      fabricContext += " REFERENCE 3 shows the INTRICATE PATTERNS and motifs that should be applied to the Pallu (shoulder drape) and the saree borders.";
    }

    const finalInstruction = `
      ${fabricContext}

      ASSEMBLY INSTRUCTIONS:
      1. Compose a professional, high-end fashion catalog image of a graceful model.
      2. The model must be wearing a saree synthesized from the provided references.
      3. Map the texture, color, and weave of Reference 1 to the main drape of the saree.
      4. If Reference 2 is present, the model's blouse MUST match that fabric's pattern and color exactly.
      5. If Reference 3 is present, incorporate those specific motifs and intricate details onto the Pallu and the borders of the saree.
      6. Use a professional Nivi drape style to showcase all components clearly.
      7. The background should be a minimalist, luxury heritage setting with warm, soft lighting that highlights the fabric's quality.
    `;

    promptParts.push({ text: finalInstruction });

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {modelWearingSareeDataUri: media.url};
  }
);
