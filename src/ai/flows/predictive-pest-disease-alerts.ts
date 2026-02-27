'use server';
/**
 * @fileOverview Alertas predictivas con rotación automática y menor frecuencia para ahorrar cuota.
 */

import {getAIInstance} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveAlertInputSchema = z.object({
  soilHumidity: z.number(),
  temperature: z.number(),
  uvRadiation: z.number(),
  cropType: z.string(),
  region: z.string(),
});
export type PredictiveAlertInput = z.infer<typeof PredictiveAlertInputSchema>;

const PredictiveAlertOutputSchema = z.object({
  alertNeeded: z.boolean(),
  alertMessage: z.string(),
  predictedRisk: z.enum(['None', 'Low', 'Medium', 'High']),
  potentialProblem: z.string(),
  recommendation: z.string(),
  isFallback: z.boolean().optional(),
});
export type PredictiveAlertOutput = z.infer<typeof PredictiveAlertOutputSchema>;

export async function predictivePestDiseaseAlerts(input: PredictiveAlertInput): Promise<PredictiveAlertOutput> {
  // Rotación silenciosa para no interrumpir el flujo principal
  for (let i = 0; i < 3; i++) {
    try {
      const ai = getAIInstance(i);
      
      const prompt = ai.definePrompt({
        name: `predictiveAlertPrompt_v3_${i}`,
        input: {schema: PredictiveAlertInputSchema},
        output: {schema: PredictiveAlertOutputSchema},
        prompt: `Analiza sensores: Humedad Suelo: {{{soilHumidity}}}%, Temp: {{{temperature}}}°C. Indica riesgo de plagas.`,
      });

      const {output} = await prompt(input);
      return { ...output!, isFallback: false };
    } catch (e: any) {
      continue; // Si falla, intenta la siguiente llave rápido
    }
  }

  // Fallback local si Google nos bloquea todas las llaves
  return {
    alertNeeded: input.soilHumidity > 85,
    alertMessage: "IA en pausa por cuota. Análisis local activo.",
    predictedRisk: input.soilHumidity > 85 ? "Medium" : "None",
    potentialProblem: input.soilHumidity > 85 ? "Riesgo de Hongos" : "Ninguno",
    recommendation: "Espera 2 minutos para que la IA se reconecte.",
    isFallback: true
  };
}
