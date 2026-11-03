import { StyleSheet, Text } from 'react-native';

export type CatalogSource = 'ours' | 'youtube' | 'jamendo';

const LABELS: Record<CatalogSource, { text: string; color: string }> = {
  ours: { text: 'Ours', color: '#34d399' },
  youtube: { text: 'YouTube', color: '#f87171' },
  jamendo: { text: 'Jamendo', color: '#fbbf24' },
};

// small pill next to a category title showing where its songs come from
// (renders nothing for data from an older server without `source`)
const SourceLabel = ({ source }: { source?: CatalogSource }) => {
  if (!source || !LABELS[source]) return null;
  const { text, color } = LABELS[source];
  return (
    <Text style={[styles.label, { color, borderColor: color }]}>
      {text.toUpperCase()}
    </Text>
  );
};
export default SourceLabel;

const styles = StyleSheet.create({
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
    opacity: 0.9,
  },
});
