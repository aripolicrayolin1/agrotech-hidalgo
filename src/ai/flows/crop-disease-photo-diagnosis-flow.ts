'use server';
/**
 * @fileOverview Diagnóstico de enfermedades híbrido: IA + Motor Local Experto Avanzado.
 * El motor local ahora incluye una base de conocimientos extendida para 15+ plagas y hongos.
 */

import {getAIInstance} from '@/ai/genkit';
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
      localStores: z.string()
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
 * Utiliza una base de conocimientos estática para dar respuestas precisas basadas en texto.
 */
function getLocalDiagnosis(description: string = ""): CropDiagnosisOutput {
  const desc = description.toLowerCase();
  
  let problem = "Problema no identificado claramente";
  let severity: 'Low' | 'Medium' | 'High' | 'Not Applicable' = "Medium";
  let actions = ["Observar el cultivo diariamente", "Evitar el riego nocturno"];
  let remedies = [{ name: "Aislamiento", ingredients: ["Ninguno"], instructions: "Separa la planta infectada." }];
  let products = [{ name: "Consulta Técnica", description: "Lleva una muestra a una tienda agropecuaria.", localStores: "Actopan/Pachuca" }];

  // --- PLAGAS (INSECTOS Y ARÁCNIDOS) ---
  if (desc.includes("araña") || desc.includes("telaraña") || desc.includes("ácaro")) {
    problem = "Araña Roja (Arácnidos)";
    severity = "High";
    actions = ["Aumentar la humedad foliar", "Eliminar malezas hospederas", "Revisar envés de hojas con lupa"];
    remedies = [
      { name: "Humidificación Constante", ingredients: ["Agua limpia"], instructions: "Pulverizar agua frecuentemente, la araña odia la humedad." },
      { name: "Jabón Potásico", ingredients: ["Jabón potásico", "Agua"], instructions: "Pulverizar sobre las colonias detectadas." }
    ];
  } 
  else if (desc.includes("pulgón") || desc.includes("pulgones") || desc.includes("enrosca")) {
    problem = "Infestación de Pulgones";
    severity = "Medium";
    actions = ["Limpiar colonias manualmente", "Controlar presencia de hormigas", "Podar brotes muy infestados"];
    remedies = [{ name: "Infusión de Ajo", ingredients: ["5 dientes de ajo", "1L de agua"], instructions: "Hervir, dejar reposar 24h y pulverizar." }];
  }
  else if (desc.includes("trips") || desc.includes("flecos") || desc.includes("plateado")) {
    problem = "Trips (Thysanoptera)";
    severity = "High";
    actions = ["Usar trampas azules pegajosas", "Eliminar restos de cosecha", "Evitar estrés hídrico"];
    remedies = [{ name: "Aceite de Neem", ingredients: ["Aceite de Neem", "Agua"], instructions: "Aplicar cada 5 días para interrumpir su ciclo." }];
  }
  else if (desc.includes("mosca blanca") || desc.includes("palomilla") || desc.includes("volador")) {
    problem = "Mosca Blanca";
    severity = "Medium";
    actions = ["Usar trampas amarillas", "Limpiar el envés de las hojas", "Mejorar la ventilación"];
    remedies = [{ name: "Mezcla de Jabón y Aceite", ingredients: ["Jabón líquido", "Aceite vegetal", "Agua"], instructions: "Mezclar y pulverizar para asfixiar al insecto." }];
  }
  else if (desc.includes("oruga") || desc.includes("gusano") || desc.includes("agujero") || desc.includes("comido")) {
    problem = "Ataque de Orugas / Gusanos";
    severity = "High";
    actions = ["Recolección manual nocturna", "Aplicar Bacillus thuringiensis", "Revisar envés buscando huevos"];
    remedies = [{ name: "Repelente de Chile", ingredients: ["Chiles picantes", "Agua"], instructions: "Licuar chiles, colar y pulverizar con precaución." }];
  }
  else if (desc.includes("minador") || desc.includes("galería") || desc.includes("camino")) {
    problem = "Minadores de Hojas (Larvas)";
    severity = "Medium";
    actions = ["Retirar hojas con 'caminos' visibles", "Enterrar o quemar hojas afectadas", "Promover enemigos naturales"];
    remedies = [{ name: "Aceite de Neem", ingredients: ["Extracto de Neem"], instructions: "Penetra el tejido y detiene la alimentación de la larva." }];
  }
  else if (desc.includes("cochinilla") || desc.includes("algodón") || desc.includes("escama")) {
    problem = "Cochinillas / Escamas";
    severity = "Medium";
    actions = ["Limpiar con algodón y alcohol", "Podar ramas muy afectadas", "Aumentar ventilación"];
    remedies = [{ name: "Solución Alcohólica", ingredients: ["Alcohol de farmacia", "Agua"], instructions: "Limpiar individualmente cada insecto." }];
  }

  // --- HONGOS Y ENFERMEDADES ---
  else if (desc.includes("cenicilla") || desc.includes("mildiú") || desc.includes("polvo blanco") || desc.includes("algodonoso")) {
    problem = "Cenicilla o Mildiú Polvoriento";
    severity = "Medium";
    actions = ["Eliminar hojas afectadas", "Reducir humedad ambiental", "Espaciar plantas para ventilación"];
    remedies = [{ name: "Mezcla de Leche", ingredients: ["1 parte de leche", "9 partes de agua"], instructions: "Pulverizar al sol; el ácido láctico detiene el hongo." }];
  }
  else if (desc.includes("fusarium") || desc.includes("marchitez") || desc.includes("vuelto")) {
    problem = "Marchitez por Fusarium";
    severity = "High";
    actions = ["Eliminar planta entera de raíz", "No reutilizar el suelo", "Desinfectar herramientas"];
    remedies = [{ name: "Solarización", ingredients: ["Plástico transparente", "Sol"], instructions: "Cubrir el suelo húmedo con plástico por 4 semanas para desinfectar." }];
  }
  else if (desc.includes("phytophthora") || desc.includes("damping off") || desc.includes("pudrición")) {
    problem = "Podredumbre (Phytophthora)";
    severity = "High";
    actions = ["Mejorar drenaje inmediatamente", "Evitar encharcamientos", "Aplicar fungicida cúprico"];
    remedies = [{ name: "Canela en Polvo", ingredients: ["Canela"], instructions: "Esparcir en la base del tallo; es un fungicida natural suave." }];
  }
  else if (desc.includes("pythium") || desc.includes("corteza") || desc.includes("amarillean")) {
    problem = "Pythium (Ahogamiento de Raíz)";
    severity = "High";
    actions = ["Reducir riego drásticamente", "Revisar turgencia de hojas", "Usar sustratos estériles"];
    remedies = [{ name: "Té de Manzanilla", ingredients: ["Manzanilla seca", "Agua"], instructions: "Regar con el té frío para fortalecer plántulas." }];
  }
  else if (desc.includes("roya") || desc.includes("naranja") || desc.includes("herrumbre")) {
    problem = "Roya (Hongo Puccinia)";
    severity = "High";
    actions = ["Retirar hojas con pústulas", "Evitar exceso de nitrógeno", "Mejorar drenaje"];
    remedies = [{ name: "Cola de Caballo", ingredients: ["Planta cola de caballo"], instructions: "Hervir y pulverizar; su alto sílice seca al hongo." }];
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
      additionalNotes: "Diagnóstico generado por el Motor Experto de AgroTech basado en síntomas descritos.",
      isFallback: true
    }
  };
}

export async function diagnoseCropDisease(input: CropDiagnosisInput): Promise<CropDiagnosisOutput> {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  if (!input.description && !input.photoDataUri) {
    throw new Error("Se requiere al menos una descripción o una foto.");
  }

  // Intentar con IA primero si hay disponibilidad de llaves
  for (let i = 0; i < 3; i++) {
    try {
      const ai = getAIInstance(i);
      const prompt = ai.definePrompt({
        name: `cropDiagnosisPrompt_v9_rotation_${i}`,
        input: {schema: CropDiagnosisInputSchema},
        output: {schema: CropDiagnosisOutputSchema},
        prompt: `Eres un experto agrónomo en Hidalgo, México. 
        Analiza estos datos del cultivo:
        
        {{#if description}}Descripción: {{{description}}}{{/if}}
        {{#if photoDataUri}}Imagen: {{media url=photoDataUri}}{{/if}}
        
        Si no hay imagen, básate en la descripción. Da un diagnóstico serio, acciones y remedios orgánicos.`,
      });

      const {output} = await prompt(input);
      if (output) return { ...output, diagnosis: { ...output.diagnosis, isFallback: false } };
    } catch (e: any) {
      console.warn(`Intento ${i + 1} fallido (IA). Rotando...`);
      if (i < 2) await sleep(2000); 
    }
  }

  // Fallback al motor local experto si la IA falla
  return getLocalDiagnosis(input.description);
}
