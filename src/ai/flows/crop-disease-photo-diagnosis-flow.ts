'use server';
/**
 * @fileOverview This file implements a Genkit flow for diagnosing crop diseases or pests from a photo.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropDiagnosisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop as a data URI."
    ),
  description: z.string().optional().describe('Description of the symptoms.'),
});
export type CropDiagnosisInput = z.infer<typeof CropDiagnosisInputSchema>;

const CropDiagnosisOutputSchema = z.object({
  diagnosis: z.object({
    isProblemDetected: z.boolean(),
    identifiedProblem: z.string(),
    severity: z.enum(['Low', 'Medium', 'High', 'Not Applicable']),
    confidence: z.enum(['Low', 'Medium', 'High']),
    recommendedActions: z.array(z.string()),
    commercialProducts: z.array(z.object({
      name: z.string(),
      description: z.string(),
      localStores: z.string()
    })),
    homeMadeRemedies: z.array(z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string()
    })),
    additionalNotes: z.string().optional(),
    isWaiting: z.boolean().optional(),
  }),
});
export type CropDiagnosisOutput = z.infer<typeof CropDiagnosisOutputSchema>;

export async function diagnoseCropDisease(input: CropDiagnosisInput): Promise<CropDiagnosisOutput> {
  return cropDiagnosisFlow(input);
}

const cropDiagnosisPrompt = ai.definePrompt({
  name: 'cropDiagnosisPrompt',
  input: {schema: CropDiagnosisInputSchema},
  output: {schema: CropDiagnosisOutputSchema},
  prompt: `Eres un experto fitopatólogo en Hidalgo, México. Analiza la imagen y diagnostica el problema.

Si hay un problema:
- Identifica el patógeno.
- Sugiere productos comerciales disponibles en zonas como Actopan o Pachuca.
- Da un remedio casero detallado (ingredientes y uso).

Si no hay problema, indica que el cultivo está sano.

Descripción: {{{description}}}
Imagen: {{media url=photoDataUri}}`,
});

const cropDiagnosisFlow = ai.defineFlow(
  {
    name: 'cropDiagnosisFlow',
    inputSchema: CropDiagnosisInputSchema,
    outputSchema: CropDiagnosisOutputSchema,
  },
  async input => {
    try {
      const {output} = await cropDiagnosisPrompt(input);
      return {
        ...output!,
        diagnosis: {
          ...output!.diagnosis,
          isWaiting: false
        }
      };
    } catch (e: any) {
      const isQuotaError = e.message?.includes('RESOURCE_EXHAUSTED') || e.status === 429;
      console.warn(`AI Error:`, e.message);
      
      return {
        diagnosis: {
          isProblemDetected: true,
          identifiedProblem: isQuotaError ? "IA en Espera (Límite de Google)" : "Error de Conexión",
          severity: "Medium",
          confidence: "Low",
          recommendedActions: isQuotaError ? [
            "El servicio gratuito de Google Gemini ha alcanzado su límite diario o por minuto.",
            "Por favor, espera unos 30 segundos antes de intentar de nuevo.",
            "Si el error persiste por mucho tiempo, podría ser el límite diario de la cuenta gratuita."
          ] : ["Hubo un problema al procesar la imagen. Reintenta en unos momentos."],
          commercialProducts: [],
          homeMadeRemedies: [],
          additionalNotes: "Estamos trabajando para optimizar el uso de la IA y reducir estos bloqueos temporales.",
          isWaiting: true
        }
      };
    }
  }
);
