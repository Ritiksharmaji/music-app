import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// generated avatars are SVG (DiceBear), which <Image> can't show; ask for PNG instead
const pngAvatar = (url: string) => url.replace('/svg?', '/png?');

const Avatar = ({ uri, name, size = 40, online }: { uri?: string; name: string; size?: number; online?: boolean }) => {
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width: size, height: size }}>
      {uri && !failed ? (
        <Image
          source={{ uri: pngAvatar(uri) }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{name[0]?.toUpperCase()}</Text>
        </View>
      )}
      {online !== undefined && (
        <View style={[styles.dot, { backgroundColor: online ? colors.online : colors.offline }]} />
      )}
    </View>
  );
};
export default Avatar;

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.cardPressed, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.text, fontWeight: '700' },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
