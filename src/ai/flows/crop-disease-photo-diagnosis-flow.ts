'use server';
/**
 * @fileOverview Diagnóstico de enfermedades con rotación de llaves y gestión de cuotas.
 */

import {getAIInstance} from '@/ai/genkit';
import {z} from 'genkit';

const CropDiagnosisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe("A photo of a crop as a data URI."),
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function diagnoseCropDisease(input: CropDiagnosisInput): Promise<CropDiagnosisOutput> {
  let lastError = null;

  for (let i = 0; i < 3; i++) {
    try {
      // Usar Gemini 1.5 Flash como respaldo si el 2.0 está muy saturado
      const ai = getAIInstance(i);
      
      const prompt = ai.definePrompt({
        name: `cropDiagnosisPrompt_v4_${i}`,
        input: {schema: CropDiagnosisInputSchema},
        output: {schema: CropDiagnosisOutputSchema},
        prompt: `Eres un experto fitopatólogo en Hidalgo. Analiza la imagen y diagnostica. 
        Si hay problemas, identifica el patógeno y sugiere productos en Hidalgo o remedios caseros.
        Descripción: {{{description}}}
        Imagen: {{media url=photoDataUri}}`,
      });

      const {output} = await prompt(input);
      return {
        ...output!,
        diagnosis: { ...output!.diagnosis, isWaiting: false }
      };
    } catch (e: any) {
      lastError = e;
      const isQuotaError = e.message?.includes('RESOURCE_EXHAUSTED') || e.status === 429;
      
      if (isQuotaError) {
        console.warn(`Llave ${i + 1} agotada. Esperando 5 segundos para enfriar...`);
        await sleep(5000); // Espera extendida para limpiar la cuota
        continue;
      }
      break; 
    }
  }

  // Si fallan todas las llaves, devolver un estado de espera informativo
  return {
    diagnosis: {
      isProblemDetected: true,
      identifiedProblem: "Sistema en Enfriamiento",
      severity: "Medium",
      confidence: "Low",
      recommendedActions: [
        "Google ha pausado las peticiones por alta demanda en tu zona.",
        "Estamos rotando tus 3 llaves, pero todas han alcanzado el límite momentáneo.",
        "Por favor, espera 15 segundos y presiona 'Iniciar Análisis' de nuevo."
      ],
      commercialProducts: [],
      homeMadeRemedies: [],
      additionalNotes: `Mensaje de Google: Por favor reintenta en 15 segundos. (Error: ${lastError?.message?.substring(0, 50)}...)`,
      isWaiting: true
    }
  };
}
