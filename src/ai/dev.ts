'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-saree-avatar.ts';
import '@/ai/flows/refine-generated-avatar.ts';
import '@/ai/flows/generate-hero-image.ts';
import '@/ai/flows/location-saree-discovery.ts';
import '@/ai/flows/generate-social-caption.ts';
import '@/ai/flows/generate-crochet-lifestyle.ts';
