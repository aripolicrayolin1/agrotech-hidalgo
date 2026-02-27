
'use server';
/**
 * @fileOverview A predictive AI agent for identifying potential pest or fungal disease risks based on sensor data.
 *
 * - predictivePestDiseaseAlerts - A function that handles the predictive alert generation process.
 * - PredictiveAlertInput - The input type for the predictivePestDiseaseAlerts function.
 * - PredictiveAlertOutput - The return type for the predictivePestDiseaseAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveAlertInputSchema = z.object({
  soilHumidity: z.number().describe('Current soil humidity percentage (0-100%).'),
  temperature: z.number().describe('Current ambient temperature in Celsius.'),
  uvRadiation: z.number().describe('Current UV radiation index or intensity.'),
  cropType: z.string().describe('The type of crop being monitored (e.g., "Maíz", "Frijol").'),
  region: z.string().describe('The agricultural region where the sensors are located (e.g., "Hidalgo").'),
});
export type PredictiveAlertInput = z.infer<typeof PredictiveAlertInputSchema>;

const PredictiveAlertOutputSchema = z.object({
  alertNeeded: z.boolean().describe('True if an alert is needed, false otherwise.'),
  alertMessage: z
    .string()
    .describe('A detailed message regarding the predicted risk and alert status.'),
  predictedRisk: z.enum(['None', 'Low', 'Medium', 'High']).describe('The predicted risk level.'),
  potentialProblem: z.string().describe('Describes the potential pest or disease problem (e.g., "Hongos por exceso de humedad"). If no alert is needed, state "Ninguno".'),
  recommendation: z.string().describe('Preventive actions or advice based on the predicted risk. If no alert is needed, state "Monitoreo continuo".'),
  isFallback: z.boolean().optional().describe('Flag to indicate if the result is from a fallback logic due to AI unavailability.'),
});
export type PredictiveAlertOutput = z.infer<typeof PredictiveAlertOutputSchema>;

export async function predictivePestDiseaseAlerts(input: PredictiveAlertInput): Promise<PredictiveAlertOutput> {
  return predictiveAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictivePestDiseaseAlertsPrompt',
  input: {schema: PredictiveAlertInputSchema},
  output: {schema: PredictiveAlertOutputSchema},
  prompt: `Eres un agrónomo experto especializado en agricultura de precisión en la región de {{region}}. Tu tarea es analizar los datos de sensores en tiempo real para el cultivo de {{cropType}} y predecir posibles infestaciones de plagas o enfermedades fúngicas.

Datos actuales de los sensores (normalizados):
- Humedad del suelo: {{{soilHumidity}}}%
- Temperatura: {{{temperature}}}°C
- Radiación UV: {{{uvRadiation}}}

Considera los umbrales típicos y las condiciones climáticas para el cultivo de {{cropType}} en la región de {{region}}.

Genera una alerta predictiva. Si las condiciones son propicias para un problema, establece 'alertNeeded' en true y proporciona un mensaje detallado, el nivel de riesgo, el problema potencial y una recomendación de acciones preventivas. Si las condiciones son óptimas, establece 'alertNeeded' en false y un mensaje indicando que no hay riesgos inmediatos, 'predictedRisk' en 'None', 'potentialProblem' en 'Ninguno', y 'recommendation' en 'Monitoreo continuo'.`,
});

const predictiveAlertFlow = ai.defineFlow(
  {
    name: 'predictiveAlertFlow',
    inputSchema: PredictiveAlertInputSchema,
    outputSchema: PredictiveAlertOutputSchema,
  },
  async (input) => {
    // Normalización/Clamping de valores para evitar errores de validación de IA
    const sanitizedInput = {
      ...input,
      soilHumidity: Math.max(0, Math.min(100, input.soilHumidity)),
      temperature: Math.max(-10, Math.min(60, input.temperature)),
      uvRadiation: Math.max(0, input.uvRadiation),
    };

    try {
      const {output} = await prompt(sanitizedInput);
      return { ...output!, isFallback: false };
    } catch (e: any) {
      console.warn("AI Quota exhausted or error occurred. Using fallback logic.");
      
      // Lógica de respaldo (Heurística básica para cuando Gemini está saturado)
      const highHumidity = sanitizedInput.soilHumidity > 75;
      const criticalHumidity = sanitizedInput.soilHumidity > 90;
      const highTemp = sanitizedInput.temperature > 28;
      
      if (highHumidity || highTemp) {
        return {
          alertNeeded: true,
          alertMessage: "El límite de peticiones gratuitas de Google se ha alcanzado. Usando lógica de emergencia: Se detectan parámetros fuera de rango normal.",
          predictedRisk: criticalHumidity ? "High" : "Medium",
          potentialProblem: highHumidity ? "Riesgo de proliferación de Hongos" : "Estrés térmico por calor",
          recommendation: "Revisa visualmente el cultivo y asegura una ventilación adecuada mientras se restablece el servicio de IA.",
          isFallback: true
        };
      }

      return {
        alertNeeded: false,
        alertMessage: "Servicio de IA en espera (Límite de cuota). Basado en parámetros de sensores, el cultivo parece estar en rangos estables.",
        predictedRisk: "None",
        potentialProblem: "Ninguno detectado",
        recommendation: "Continúa con el monitoreo visual preventivo.",
        isFallback: true
      };
    }
  }
);
