export interface Emotion {
  id: string;
  name: string;
  category: 'luz' | 'sombra' | 'transicion' | 'serenidad';
  color: string;
  glowColor: string;
  description: string;
  intensity?: number;
}

export interface EmotionalFlaskEntry {
  id: string;
  timestamp: string; // ISO or formatted
  date: string; // YYYY-MM-DD
  emotions: {
    emotionId: string;
    name: string;
    color: string;
    intensity: number; // 1 to 5
  }[];
  socraticQuestion: string;
  socraticReflection: string;
  intensityTotal: number;
  tags?: string[];
}

export interface RitualStep {
  title: string;
  description: string;
  durationSeconds?: number;
  type: 'breath' | 'reflection' | 'writing' | 'grounding';
  inhale?: number;
  hold?: number;
  exhale?: number;
}

export interface Ritual {
  id: string;
  titulo: string;
  intencion: string;
  duracionEstimada: string;
  categoria: 'calma' | 'desahogo' | 'claridad' | 'descanso';
  pasos: RitualStep[];
  isFavorite?: boolean;
}

export interface PresenceEcho {
  id: string;
  date: string;
  type: 'frasco' | 'ritual' | 'respiracion' | 'espejo' | 'gratitud';
  title: string;
  detail: string;
  items?: string[];
  deepReflection?: string;
  deepenedFromItem?: string;
  socraticPrompt?: string;
  tags?: string[];
}

export const DEFAULT_CONTEXT_TAGS: string[] = [
  'Trabajo',
  'Familia',
  'Creatividad',
  'Relaciones',
  'Salud',
  'Personal',
  'Descanso',
  'Espiritualidad'
];

export interface SieMessage {
  id: string;
  sender: 'user' | 'sie';
  text: string;
  timestamp: string;
  suggestedRitualId?: string;
}

export const PURO_EMOTIONS: Emotion[] = [
  {
    id: 'calma',
    name: 'Calma',
    category: 'serenidad',
    color: '#84a59d',
    glowColor: 'rgba(132, 165, 157, 0.4)',
    description: 'Quietud interior y serenidad presente.'
  },
  {
    id: 'gratitud',
    name: 'Gratitud',
    category: 'luz',
    color: '#f6bd60',
    glowColor: 'rgba(246, 189, 96, 0.4)',
    description: 'Agradecimiento profundo por lo sutil de la vida.'
  },
  {
    id: 'melancolia',
    name: 'Melancolía',
    category: 'transicion',
    color: '#9a8c98',
    glowColor: 'rgba(154, 140, 152, 0.4)',
    description: 'Belleza teñida de recuerdo y nostalgia suave.'
  },
  {
    id: 'ira',
    name: 'Ira',
    category: 'sombra',
    color: '#e07a5f',
    glowColor: 'rgba(224, 122, 95, 0.4)',
    description: 'Fuego interior que pide límites y escucha consciente.'
  },
  {
    id: 'ansiedad',
    name: 'Ansiedad',
    category: 'sombra',
    color: '#b5838d',
    glowColor: 'rgba(181, 131, 141, 0.4)',
    description: 'Turbulencia anticipatoria que anhela anclaje.'
  },
  {
    id: 'asombro',
    name: 'Asombro',
    category: 'luz',
    color: '#d4a373',
    glowColor: 'rgba(212, 163, 115, 0.4)',
    description: 'Maravilla ante lo desconocido y lo poético.'
  },
  {
    id: 'esperanza',
    name: 'Esperanza',
    category: 'luz',
    color: '#c9ada7',
    glowColor: 'rgba(201, 173, 167, 0.4)',
    description: 'Luz tenue que confía en el devenir natural.'
  },
  {
    id: 'pesadez',
    name: 'Pesadez',
    category: 'transicion',
    color: '#6d6875',
    glowColor: 'rgba(109, 104, 117, 0.4)',
    description: 'Cansancio corporal y necesidad de descanso profundo.'
  }
];

export const PURO_RITUALS: Ritual[] = [
  {
    id: 'arraigo-5min',
    titulo: '5 Minutos de Arraigo',
    intencion: 'Anclar la mente al cuerpo mediante los cinco sentidos para disolver la sobrecarga mental.',
    duracionEstimada: '5 min',
    categoria: 'calma',
    pasos: [
      {
        title: 'Contacto con el Suelo',
        description: 'Siente el peso de tus pies sobre la tierra. Relaja hombros y mandíbula.',
        type: 'grounding',
        durationSeconds: 45
      },
      {
        title: 'Respiración de Frecuencia Salvia',
        description: 'Inhala en 4 segundos, retén 4 segundos y exhala suavemente en 6 segundos.',
        type: 'breath',
        durationSeconds: 120,
        inhale: 4,
        hold: 4,
        exhale: 6
      },
      {
        title: 'Escaneo de Sensaciones',
        description: 'Nombra mentalmente tres sonidos sutiles a tu alrededor sin juzgarlos.',
        type: 'reflection',
        durationSeconds: 60
      }
    ]
  },
  {
    id: 'desahogo-escrito',
    titulo: 'Escritura de Desahogo',
    intencion: 'Vaciar la mente sin filtro ni puntuación obligatoria para liberar emociones estancadas.',
    duracionEstimada: '7 min',
    categoria: 'desahogo',
    pasos: [
      {
        title: 'Invocación del Silencio',
        description: 'Cierra los ojos por un instante. Respira profundo tres veces.',
        type: 'breath',
        durationSeconds: 30,
        inhale: 4,
        hold: 2,
        exhale: 4
      },
      {
        title: 'Flujo Libre de Consciencia',
        description: 'Escribe todo lo que queme o fatigue en tu mente. Nadie más lo leerá.',
        type: 'writing',
        durationSeconds: 240
      },
      {
        title: 'Soltar y Cierre',
        description: 'Agradece a tus pensamientos por haber salido a la luz y déjalos descansar.',
        type: 'reflection',
        durationSeconds: 45
      }
    ]
  },
  {
    id: 'respiracion-cuadrada',
    titulo: 'Respiración en Caja 4-4-4-4',
    intencion: 'Equilibrar el sistema nervioso autónomo ante picos de angustia o estrés agudo.',
    duracionEstimada: '4 min',
    categoria: 'calma',
    pasos: [
      {
        title: 'Ciclo de Coherencia',
        description: 'Sigue el círculo de respiración: 4s inhala, 4s retén, 4s exhala, 4s vacío.',
        type: 'breath',
        durationSeconds: 180,
        inhale: 4,
        hold: 4,
        exhale: 4
      }
    ]
  },
  {
    id: 'cierre-nocturno',
    titulo: 'Cierre y Soltar Nocturno',
    intencion: 'Entregar los asuntos no resueltos del día a la noche para conciliar un sueño reparador.',
    duracionEstimada: '6 min',
    categoria: 'descanso',
    pasos: [
      {
        title: 'Recapitulación Serena',
        description: 'Visualiza el día como hojas que caen en un arroyo que fluye en calma.',
        type: 'reflection',
        durationSeconds: 90
      },
      {
        title: 'Respiración 4-7-8 para el Sueño',
        description: 'Inhala en 4s, sostén en 7s y exhala en un soplo largo de 8s.',
        type: 'breath',
        durationSeconds: 150,
        inhale: 4,
        hold: 7,
        exhale: 8
      },
      {
        title: 'Consigna de Paz',
        description: 'Repite mentalmente: "Por hoy es suficiente. Mi cuerpo merece paz."',
        type: 'grounding',
        durationSeconds: 60
      }
    ]
  }
];

export const SEED_FLASKS: EmotionalFlaskEntry[] = [
  {
    id: 'flask-1',
    date: '2026-08-11',
    timestamp: '11 de Agosto, 20:15',
    emotions: [
      { emotionId: 'calma', name: 'Calma', color: '#84a59d', intensity: 4 },
      { emotionId: 'gratitud', name: 'Gratitud', color: '#f6bd60', intensity: 5 },
      { emotionId: 'asombro', name: 'Asombro', color: '#d4a373', intensity: 3 }
    ],
    socraticQuestion: '¿Qué destello cotidiano despertó hoy esta profunda sensación de asombro y gratitud?',
    socraticReflection: 'Caminar por el sendero arbolado al atardecer. La luz filtrada me recordó que la belleza siempre está disponible cuando desacelero.',
    intensityTotal: 12,
    tags: ['Personal', 'Creatividad']
  },
  {
    id: 'flask-2',
    date: '2026-08-12',
    timestamp: '12 de Agosto, 18:40',
    emotions: [
      { emotionId: 'melancolia', name: 'Melancolía', color: '#9a8c98', intensity: 4 },
      { emotionId: 'pesadez', name: 'Pesadez', color: '#6d6875', intensity: 3 },
      { emotionId: 'esperanza', name: 'Esperanza', color: '#c9ada7', intensity: 2 }
    ],
    socraticQuestion: '¿Qué parte de tu pasado está pidiendo ser honrada y abrazada antes de continuar?',
    socraticReflection: 'Recordé proyectos que no salieron como esperaba. Acepto que todo ciclo que cierra deja abono para lo que está por nacer.',
    intensityTotal: 9,
    tags: ['Trabajo', 'Reflexión']
  },
  {
    id: 'flask-3',
    date: '2026-08-13',
    timestamp: '13 de Agosto, 14:10',
    emotions: [
      { emotionId: 'calma', name: 'Calma', color: '#84a59d', intensity: 5 },
      { emotionId: 'gratitud', name: 'Gratitud', color: '#f6bd60', intensity: 4 }
    ],
    socraticQuestion: 'Si esta calma tuviera una textura o una voz, ¿qué consejo le daría a tu mente agitada?',
    socraticReflection: 'Me susurraría: "Confía en el ritmo natural de las cosas. No necesitas forzar las respuestas hoy."',
    intensityTotal: 9,
    tags: ['Familia', 'Descanso']
  }
];

export const SOCRATIC_QUESTIONS_BANK = [
  "¿Qué mensaje silencioso o necesidad oculta trae consigo esta combinación de emociones?",
  "Si este estado anímico fuera un paisaje, ¿qué clima habría y qué te invita a contemplar?",
  "¿Qué peso innecesario estás cargando hoy que podrías soltar en este frasco?",
  "¿Qué parte de ti está pidiendo ternura, escucha o descanso en este instante?",
  "¿Cómo cambiaría tu día si no intentaras cambiar lo que sientes, sino solo acompañarlo?",
  "¿Qué gratitud inadvertida florece incluso en medio de esta inquietud?",
  "Si le hablaras a tu emoción como a un amigo querido que visita tu casa, ¿qué le dirías?"
];

// Physical Symptoms & Somatic Tracking Models
export interface PhysicalSymptomItem {
  id: string;
  name: string;
  category: 'muscular' | 'neurologico' | 'respiratorio' | 'digestivo' | 'energia' | 'otro';
  severity: 'leve' | 'moderado' | 'intenso';
  notes?: string;
}

export interface DailySymptomEntry {
  id: string;
  date: string; // YYYY-MM-DD (e.g. '2026-08-13')
  timestamp: string; // Formatted date (e.g. '13 de Agosto')
  symptoms: PhysicalSymptomItem[];
  energyLevel?: number; // 1 to 5
  notes?: string;
}

export const COMMON_PHYSICAL_SYMPTOMS: {
  id: string;
  name: string;
  category: PhysicalSymptomItem['category'];
  defaultDesc: string;
}[] = [
  { id: 'tension-cuello', name: 'Tensión en cuello / hombros', category: 'muscular', defaultDesc: 'Rigidez, contractura o sobrecarga por postura/estrés' },
  { id: 'dolor-cabeza', name: 'Dolor de cabeza / Cefalea', category: 'neurologico', defaultDesc: 'Presión temporal, pesadez u opresión craneal' },
  { id: 'fatiga-corporal', name: 'Fatiga física / Agotamiento', category: 'energia', defaultDesc: 'Falta de vitalidad o pesadez muscular general' },
  { id: 'insomnio', name: 'Dificultad para dormir / Insomnio', category: 'energia', defaultDesc: 'Despertares nocturnos o sueño no reparador' },
  { id: 'opresion-pecho', name: 'Opresión en el pecho', category: 'respiratorio', defaultDesc: 'Sensación de respiración superficial o nudo torácico' },
  { id: 'malestar-estomacal', name: 'Malestar digestivo / Acidez', category: 'digestivo', defaultDesc: 'Pesadez estomacal, nudo abdominal o ardor' },
  { id: 'dolor-espalda', name: 'Dolor de espalda / Lumbar', category: 'muscular', defaultDesc: 'Molestia o rigidez en columna vertebral' },
  { id: 'bruxismo', name: 'Tensión en mandíbula / Bruxismo', category: 'muscular', defaultDesc: 'Apretar los dientes o cansancio mandibular' },
  { id: 'pesadez-ojos', name: 'Cansancio visual / Ojos pesados', category: 'neurologico', defaultDesc: 'Fatiga ocular por sobreexposición a pantallas' }
];

export const SEED_SYMPTOM_ENTRIES: DailySymptomEntry[] = [
  {
    id: 'symptom-entry-1',
    date: '2026-08-11',
    timestamp: '11 de Agosto',
    symptoms: [
      {
        id: 'tension-cuello',
        name: 'Tensión en cuello / hombros',
        category: 'muscular',
        severity: 'moderado',
        notes: 'Sobrecarga tras jornada larga de concentración.'
      },
      {
        id: 'fatiga-corporal',
        name: 'Fatiga física / Agotamiento',
        category: 'energia',
        severity: 'leve',
        notes: 'Poco descanso la noche previa.'
      }
    ],
    energyLevel: 3,
    notes: 'Sensación de rigidez en la parte alta de la espalda.'
  },
  {
    id: 'symptom-entry-2',
    date: '2026-08-12',
    timestamp: '12 de Agosto',
    symptoms: [
      {
        id: 'tension-cuello',
        name: 'Tensión en cuello / hombros',
        category: 'muscular',
        severity: 'moderado',
        notes: 'Continúa la molestia al girar el cuello.'
      }
    ],
    energyLevel: 3,
    notes: 'Intenté estirar un poco pero persiste la contracción.'
  },
  {
    id: 'symptom-entry-3',
    date: '2026-08-13',
    timestamp: '13 de Agosto',
    symptoms: [
      {
        id: 'tension-cuello',
        name: 'Tensión en cuello / hombros',
        category: 'muscular',
        severity: 'intenso',
        notes: 'Dolor punzante que irradia hacia la nuca.'
      },
      {
        id: 'dolor-cabeza',
        name: 'Dolor de cabeza / Cefalea',
        category: 'neurologico',
        severity: 'leve',
        notes: 'Cefalea leve por la tarde.'
      }
    ],
    energyLevel: 2,
    notes: 'El cuerpo me pide descanso y pausas ergonómicas urgentes.'
  }
];

