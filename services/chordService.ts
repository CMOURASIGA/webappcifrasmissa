
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatsMap: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'db': 'C#', 'eb': 'D#', 'gb': 'F#', 'ab': 'G#', 'bb': 'A#'
};

// Regex to detect common chord structures
// Matches: [A-G][#,b]?[m,dim,aug,maj,sus]?[0-9,+,(-)]*[/]?[A-G]?[#,b]?
const chordRegex = /\b([A-G][#b]?)(m|dim|aug|maj|sus|add|M)?([0-9]{1,2}|[+])?(\([0-9#b, ]+\))?(\/[A-G][#b]?)?\b/g;

export const transposeChord = (chord: string, steps: number): string => {
  return chord.replace(/([A-G][#b]?)/g, (match) => {
    let note = match;
    // Normalize flats to sharps
    if (flatsMap[note]) note = flatsMap[note];
    
    const index = chromaticScale.indexOf(note);
    if (index === -1) return match;
    
    let newIndex = (index + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return chromaticScale[newIndex];
  });
};

export const transposeText = (text: string, steps: number): string => {
  if (steps === 0) return text;
  
  // Strategy: Identify lines that likely contain only/mostly chords
  const lines = text.split('\n');
  const transposedLines = lines.map(line => {
    // A simple heuristic: if a line has more spaces/chords than long words, it's a chord line
    const tokens = line.split(/\s+/).filter(t => t.length > 0);
    const chordCount = tokens.filter(t => t.match(chordRegex)).length;
    
    // If more than 50% of tokens look like chords, transpose the whole line
    if (chordCount > 0 && chordCount / tokens.length > 0.4) {
      return line.replace(chordRegex, (match) => transposeChord(match, steps));
    }
    return line;
  });
  
  return transposedLines.join('\n');
};

export const isChordLine = (line: string): boolean => {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length === 0) return false;
  const chordCount = tokens.filter(t => t.match(chordRegex)).length;
  return chordCount > 0 && chordCount / tokens.length > 0.5;
};
