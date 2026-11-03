import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Chip = { id: string; name: string };

const Chips = ({ chips, active, onSelect }: { chips: Chip[]; active: string; onSelect: (id: string) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
    {chips.map(chip => {
      const selected = chip.id === active;
      return (
        <Pressable key={chip.id} onPress={() => onSelect(chip.id)} style={[styles.chip, selected && styles.selected]}>
          <Text style={[styles.text, selected && styles.selectedText]}>{chip.name}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);
export default Chips;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.card },
  selected: { backgroundColor: colors.accent },
  text: { color: colors.text, fontSize: 13, fontWeight: '500' },
  selectedText: { color: colors.accentText, fontWeight: '600' },
});
