import { ParsedSheetData } from './types';

export interface SampleRosterDefinition {
  id: string;
  name: string;
  description: string;
  sport: string;
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  rowCount: number;
  data: Array<{
    name: string;
    number: string;
    size: string;
    position?: string;
  }>;
}

export const SAMPLE_ROSTERS: SampleRosterDefinition[] = [
  {
    id: 'basketball-10',
    name: '10-Player Basketball Team',
    description: 'Hawks Basketball roster with standard starting five and bench rotation',
    sport: 'Basketball',
    teamName: 'HAWKS',
    primaryColor: '#dc2626', // red
    secondaryColor: '#facc15', // gold
    rowCount: 10,
    data: [
      { name: 'CARTER', number: '15', size: 'L', position: 'Point Guard' },
      { name: 'JORDAN', number: '23', size: 'XL', position: 'Shooting Guard' },
      { name: 'BRYANT', number: '24', size: 'L', position: 'Small Forward' },
      { name: 'JAMES', number: '6', size: '2XL', position: 'Power Forward' },
      { name: "O'NEAL", number: '34', size: '3XL', position: 'Center' },
      { name: 'CURRY', number: '30', size: 'M', position: 'Guard' },
      { name: 'ALLEN', number: '20', size: 'L', position: 'Guard' },
      { name: 'DURANT', number: '35', size: 'XL', position: 'Forward' },
      { name: 'BARKLEY', number: '32', size: 'XL', position: 'Forward' },
      { name: 'RODMAN', number: '91', size: 'L', position: 'Forward' },
    ],
  },
  {
    id: 'soccer-25',
    name: '25-Player Soccer Squad',
    description: 'FC Strikers first team squad with goalkeepers, defenders, midfielders, and forwards',
    sport: 'Soccer',
    teamName: 'STRIKERS FC',
    primaryColor: '#1d4ed8', // blue
    secondaryColor: '#ffffff', // white
    rowCount: 25,
    data: [
      { name: 'ALISSON', number: '1', size: 'XL', position: 'Goalkeeper' },
      { name: 'WALKER', number: '2', size: 'L', position: 'Right Back' },
      { name: 'DIAS', number: '3', size: 'XL', position: 'Center Back' },
      { name: 'VAN DIJK', number: '4', size: '2XL', position: 'Center Back' },
      { name: 'ROBERTSON', number: '5', size: 'M', position: 'Left Back' },
      { name: 'RODRI', number: '6', size: 'L', position: 'Defensive Mid' },
      { name: 'DE BRUYNE', number: '7', size: 'L', position: 'Attacking Mid' },
      { name: 'KROOS', number: '8', size: 'M', position: 'Central Mid' },
      { name: 'HAALAND', number: '9', size: '2XL', position: 'Striker' },
      { name: 'MESSI', number: '10', size: 'M', position: 'Forward' },
      { name: 'SALAH', number: '11', size: 'M', position: 'Right Winger' },
      { name: 'EDERSON', number: '12', size: 'XL', position: 'Goalkeeper' },
      { name: 'BELLINGHAM', number: '13', size: 'L', position: 'Midfielder' },
      { name: 'MODRIC', number: '14', size: 'S', position: 'Midfielder' },
      { name: 'VALVERDE', number: '15', size: 'L', position: 'Midfielder' },
      { name: 'SAKA', number: '16', size: 'M', position: 'Winger' },
      { name: 'RICE', number: '17', size: 'L', position: 'Midfielder' },
      { name: 'KANE', number: '18', size: 'XL', position: 'Striker' },
      { name: 'ALVAREZ', number: '19', size: 'M', position: 'Forward' },
      { name: 'GREALISH', number: '20', size: 'L', position: 'Winger' },
      { name: 'STONES', number: '21', size: 'L', position: 'Defender' },
      { name: 'RUDIGER', number: '22', size: 'XL', position: 'Defender' },
      { name: 'DAVIES', number: '23', size: 'M', position: 'Left Back' },
      { name: 'SON', number: '24', size: 'M', position: 'Forward' },
      { name: 'MARTINEZ', number: '25', size: 'XL', position: 'Goalkeeper' },
    ],
  },
  {
    id: 'edge-cases',
    name: 'Edge Cases & Validation Test (12 Players)',
    description: 'Includes duplicate numbers (#7), missing names, missing numbers, and extra-long names (>14 chars)',
    sport: 'Multi-Sport',
    teamName: 'TEST SQUAD',
    primaryColor: '#7c3aed', // purple
    secondaryColor: '#f97316', // orange
    rowCount: 12,
    data: [
      { name: 'SMITH', number: '7', size: 'M', position: 'Midfielder' },
      { name: 'JOHNSON', number: '7', size: 'L', position: 'Defender' }, // Duplicate number #7
      { name: 'ALEXANDER-RODRIGUEZ', number: '14', size: 'XL', position: 'Forward' }, // Extra long name (19 chars)
      { name: '', number: '10', size: 'L', position: 'Striker' }, // Missing name
      { name: 'WILLIAMS', number: '', size: 'M', position: 'Winger' }, // Missing number
      { name: 'SCHWEINSTEIGER', number: '31', size: '2XL', position: 'Midfielder' }, // Long name (14 chars)
      { name: 'MÜLLER', number: '25', size: 'L', position: 'Forward' }, // Special UTF-8 character
      { name: "O'CONNOR", number: '8', size: 'M', position: 'Defender' }, // Apostrophe
      { name: 'DE LA CRUZ', number: '17', size: 'S', position: 'Midfielder' }, // Spaces
      { name: 'BROWN', number: '00', size: 'L', position: 'Center' }, // Leading zero double digit
      { name: 'GARCIA', number: '3', size: 'CUSTOM_XXL', position: 'Defender' }, // Non-standard size
      { name: 'TAYLOR', number: '99', size: 'XL', position: 'Striker' }, // Normal
    ],
  },
  {
    id: 'large-100',
    name: '100-Player Large Batch Stress Test',
    description: 'High-volume roster testing bulk queue speed, memory efficiency, and pagination',
    sport: 'Athletics Club',
    teamName: 'METRO CLUB',
    primaryColor: '#059669', // emerald
    secondaryColor: '#f8fafc', // slate
    rowCount: 100,
    data: generateLargeRoster(100),
  },
];

function generateLargeRoster(count: number) {
  const firstNames = ['LIAM', 'NOAH', 'OLIVER', 'JAMES', 'ELIJAH', 'MATEO', 'THEODORE', 'HENRY', 'LUCAS', 'WILLIAM'];
  const lastNames = [
    'ANDERSON', 'THOMAS', 'JACKSON', 'WHITE', 'HARRIS', 'MARTIN', 'THOMPSON', 'GARCIA',
    'MARTINEZ', 'ROBINSON', 'CLARK', 'RODRIGUEZ', 'LEWIS', 'LEE', 'WALKER', 'HALL',
    'ALLEN', 'YOUNG', 'HERNANDEZ', 'KING', 'WRIGHT', 'LOPEZ', 'HILL', 'SCOTT', 'GREEN'
  ];
  const sizes = ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  const rows = [];
  for (let i = 1; i <= count; i++) {
    const lastName = lastNames[(i - 1) % lastNames.length];
    const firstName = firstNames[(i - 1) % firstNames.length];
    const size = sizes[(i - 1) % sizes.length];
    rows.push({
      name: `${lastName}`,
      number: `${i}`,
      size,
      position: `Player ${firstName}`,
    });
  }
  return rows;
}

/**
 * Converts a sample roster into a ParsedSheetData object ready for mapping
 */
export function sampleRosterToParsedSheet(sample: SampleRosterDefinition): ParsedSheetData {
  const headers = ['Player Name', 'Jersey Number', 'Size', 'Position'];
  const rawRows = sample.data.map((row) => ({
    'Player Name': row.name,
    'Jersey Number': row.number,
    'Size': row.size,
    'Position': row.position || '',
  }));

  return {
    fileName: `${sample.teamName.toLowerCase().replace(/\s+/g, '_')}_roster.csv`,
    fileSize: rawRows.length * 48,
    sheetNames: ['Roster'],
    activeSheet: 'Roster',
    headers,
    rawRows,
    totalRawRows: rawRows.length,
  };
}
