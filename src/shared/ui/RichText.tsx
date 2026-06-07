import { Colors } from '@/shared/constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

// ── Types ──────────────────────────────────────────────────────────────────

type InlineSegment = { type: 'text' | 'bold'; value: string };
type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; segments: InlineSegment[] };

// ── Parser ─────────────────────────────────────────────────────────────────

function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: raw.slice(last, m.index) });
    segments.push({ type: 'bold', value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < raw.length) segments.push({ type: 'text', value: raw.slice(last) });
  return segments;
}

function parseBlocks(content: string): Block[] {
  return content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      if (raw.startsWith('## ')) return { type: 'heading', text: raw.slice(3) };
      return { type: 'paragraph', segments: parseInline(raw) };
    });
}

/** Strips all Markdown syntax — use for truncated list previews. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^##\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

// ── Component ──────────────────────────────────────────────────────────────

interface RichTextProps {
  content: string;
}

export function RichText({ content }: RichTextProps) {
  const blocks = parseBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <View key={i} style={[styles.headingRow, i > 0 && styles.headingRowSpaced]}>
              <View style={styles.headingAccent} />
              <Text style={styles.heading}>{block.text}</Text>
            </View>
          );
        }

        return (
          <Text key={i} style={styles.paragraph}>
            {block.segments.map((seg, j) =>
              seg.type === 'bold'
                ? <Text key={j} style={styles.bold}>{seg.value}</Text>
                : seg.value
            )}
          </Text>
        );
      })}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 12 },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingRowSpaced: { marginTop: 6 },

  headingAccent: {
    width: 3,
    height: 13,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  heading: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  paragraph: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 24,
  },

  bold: {
    fontWeight: '700',
    color: Colors.text,
  },
});
