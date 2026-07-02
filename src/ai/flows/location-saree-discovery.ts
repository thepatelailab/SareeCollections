'use server';
/**
 * @fileOverview Discovery agent for location-based saree varieties and global textiles.
 * 
 * This agent is trained on global textile traditions including India, Bangladesh, 
 * Sri Lanka, Pakistan, Indonesia, Japan, and more.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiscoverItemsInputSchema = z.object({
  type: z.enum(['countries', 'states', 'sarees']),
  parentCountry: z.string().optional().describe('Required if type is states or sarees'),
  parentState: z.string().optional().describe('Required if type is sarees'),
});
export type DiscoverItemsInput = z.infer<typeof DiscoverItemsInputSchema>;

// Internal schema for prompt to handle logic-less template
const PromptInputSchema = DiscoverItemsInputSchema.extend({
  isCountries: z.boolean(),
  isStates: z.boolean(),
  isSarees: z.boolean(),
});

const DiscoverItemsOutputSchema = z.object({
  items: z.array(z.object({
    name: z.string().describe('The name of the country, state, or textile/saree variety.'),
    description: z.string().optional().describe('A concise description of the textile heritage.'),
  })),
});
export type DiscoverItemsOutput = z.infer<typeof DiscoverItemsOutputSchema>;

export async function discoverItems(input: DiscoverItemsInput): Promise<DiscoverItemsOutput> {
  return discoverItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discoverItemsPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: DiscoverItemsOutputSchema },
  prompt: `You are a world-renowned cultural textile historian and expert in ethnic wear, specializing in sarees and traditional handlooms.

  {{#if isCountries}}
  Suggest a list of countries famous for their rich textile traditions. 
  Include: India, Bangladesh, Sri Lanka, Nepal, Pakistan, Indonesia, Thailand, Japan, China, and Uzbekistan.
  {{/if}}

  {{#if isStates}}
  Return a list of the most prominent textile-producing regions or states within {{{parentCountry}}}.
  - For India, focus on states like Odisha, Tamil Nadu, Uttar Pradesh, West Bengal, Maharashtra, and Gujarat.
  - For other countries, identify major craft hubs (e.g., Kyoto for Japan, Bukhara for Uzbekistan).
  {{/if}}

  {{#if isSarees}}
  Identify the most famous and culturally significant saree or textile varieties from {{{parentState}}} in {{{parentCountry}}}.
  
  Knowledge Base:
  - India: Banarasi, Kanchipuram, Patola, Sambalpuri, Paithani, Chanderi.
  - Bangladesh: Jamdani (UNESCO recognized), Muslin.
  - Indonesia: Batik (UNESCO recognized).
  - Japan: Nishijin silk textiles.
  - Uzbekistan: Vibrant Ikat.
  - Sri Lanka: Handloom and Batik.
  - Thailand: Thai Silk.
  - Nepal: Handwoven pashmina and cotton.
  
  Provide a short one-line description highlighting the unique weaving technique or cultural significance for each.
  {{/if}}`,
});

const discoverItemsFlow = ai.defineFlow(
  {
    name: 'discoverItemsFlow',
    inputSchema: DiscoverItemsInputSchema,
    outputSchema: DiscoverItemsOutputSchema,
  },
  async input => {
    const { output } = await prompt({
      ...input,
      isCountries: input.type === 'countries',
      isStates: input.type === 'states',
      isSarees: input.type === 'sarees',
    });
    return output!;
  }
);
