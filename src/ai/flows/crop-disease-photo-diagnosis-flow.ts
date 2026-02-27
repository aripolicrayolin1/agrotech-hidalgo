'use server';
/**
 * @fileOverview Diagnóstico de enfermedades híbrido: IA + Motor Local Experto Avanzado.
 * Incluye ahora enlaces de localización comercial para productos.
 */

import {aiInstances} from '@/ai/genkit';
import {z} from 'genkit';

const CropDiagnosisInputSchema = z.object({
  photoDataUri: z.string().optional().describe("A photo of a crop as a data URI (Optional)."),
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
      localStores: z.string(),
      locationLink: z.string().optional()
    })),
    homeMadeRemedies: z.array(z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string()
    })),
    additionalNotes: z.string().optional(),
    isFallback: z.boolean().optional(),
  }),
});
export type CropDiagnosisOutput = z.infer<typeof CropDiagnosisOutputSchema>;

/**
 * Motor de Diagnóstico Local Experto.
 */
function getLocalDiagnosis(description: string = ""): CropDiagnosisOutput {
  const desc = description.toLowerCase();
  
  let problem = "Problema no identificado claramente";
  let severity: 'Low' | 'Medium' | 'High' | 'Not Applicable' = "Medium";
  let actions = ["Observar el cultivo diariamente", "Evitar el riego nocturno", "Consultar a un técnico local"];
  let remedies = [{ name: "Aislamiento", ingredients: ["Ninguno"], instructions: "Separa la planta infectada para evitar propagación." }];
  let products = [{ name: "Consulta Técnica", description: "Lleva una muestra a una tienda agropecuaria.", localStores: "Región Hidalgo", locationLink: "https://www.google.com/maps/search/agroquimicas+hidalgo" }];

  if (desc.includes("cenicilla") || desc.includes("mildiú") || desc.includes("algodonosa") || desc.includes("blancas") || desc.includes("polvo blanco")) {
    problem = "Cenicilla o Mildiú Polvoriento";
    severity = "Medium";
    actions = ["Eliminar hojas afectadas", "Mejorar ventilación", "Reducir humedad ambiental"];
    remedies = [
      { name: "Mezcla de Leche", ingredients: ["1 parte leche", "9 partes agua"], instructions: "Pulverizar al sol directo." },
      { name: "Bicarbonato", ingredients: ["1 cda Bicarbonato", "1L Agua"], instructions: "Pulverizar cada 7 días." }
    ];
    products = [
      { name: "Topas", description: "Fungicida sistémico potente.", localStores: "Agroquímicas Pachuca/Actopan", locationLink: "https://www.google.com/maps/search/Topas+fungicida+Hidalgo" },
      { name: "Azufre Agrícola", description: "Tratamiento preventivo tradicional.", localStores: "Tiendas de Insumos locales", locationLink: "https://www.google.com/maps/search/azufre+agricola+Hidalgo" }
    ];
  } 
  else if (desc.includes("araña") || desc.includes("telaraña") || desc.includes("ácaro") || desc.includes("puntos rojos")) {
    problem = "Araña Roja (Ácaros)";
    severity = "High";
    actions = ["Aumentar riego foliar", "Eliminar malezas", "Revisar envés de hojas"];
    remedies = [{ name: "Jabón Potásico", ingredients: ["Jabón", "Agua"], instructions: "Lavar hojas por ambos lados." }];
    products = [
      { name: "Oberon (Spiromesifen)", description: "Acaricida de alta residualidad.", localStores: "Distribuidores Valle del Mezquital", locationLink: "https://www.google.com/maps/search/Oberon+insecticida+Hidalgo" },
      { name: "Vertimec", description: "Control eficaz de ácaros y trips.", localStores: "Tiendas Especializadas Pachuca", locationLink: "https://www.google.com/maps/search/Vertimec+abamectina+Hidalgo" }
    ];
  }
  else if (desc.includes("gusano") || desc.includes("oruga") || desc.includes("comido") || desc.includes("huecos")) {
    problem = "Gusano Cogollero / Orugas";
    severity = "High";
    actions = ["Monitoreo manual nocturno", "Uso de trampas", "Eliminar restos vegetales"];
    remedies = [{ name: "Repelente de Ajo y Chile", ingredients: ["Ajo", "Chile", "Agua"], instructions: "Licuar y reposar 24h antes de aplicar." }];
    products = [
      { name: "Spintor (Spinosad)", description: "Producto natural altamente efectivo.", localStores: "Agro-veterinarias Hidalgo", locationLink: "https://www.google.com/maps/search/Spintor+insecticida+Hidalgo" },
      { name: "Dipel", description: "Bacillus thuringiensis biológico.", localStores: "Tiendas de Bio-insumos", locationLink: "https://www.google.com/maps/search/Dipel+Bacillus+Hidalgo" }
    ];
  }

  return {
    diagnosis: {
      isProblemDetected: true,
      identifiedProblem: problem,
      severity,
      confidence: "High",
      recommendedActions: actions,
      commercialProducts: products,
      homeMadeRemedies: remedies,
      additionalNotes: "Motor experto optimizado para el Hackathon Praxis.",
      isFallback: true
    }
  };
}

export async function diagnoseCropDisease(input: CropDiagnosisInput): Promise<CropDiagnosisOutput> {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  if (!input.description && !input.photoDataUri) {
    throw new Error("Se requiere descripción o foto.");
  }

  for (let i = 0; i < aiInstances.length; i++) {
    try {
      const ai = aiInstances[i];
      const prompt = ai.definePrompt({
        name: `cropDiagnosisPrompt_v12_rotation_${i}`,
        input: {schema: CropDiagnosisInputSchema},
        output: {schema: CropDiagnosisOutputSchema},
        prompt: `Eres un experto agrónomo en Hidalgo. 
        Analiza síntomas: {{#if description}}{{{description}}}{{/if}}
        Da un diagnóstico científico y productos disponibles en México con enlaces de búsqueda en Google Maps.`,
      });

      const {output} = await prompt(input);
      if (output) return { ...output, diagnosis: { ...output.diagnosis, isFallback: false } };
    } catch (e: any) {
      if (i < aiInstances.length - 1) await sleep(2000);
    }
  }

  return getLocalDiagnosis(input.description);
}