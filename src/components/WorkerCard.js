import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function WorkerCard({ worker, onPress, delay }) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.cardContainer}
        >
            <View style={styles.glassContainer}>
                {/* Dark Gradient Background */}
                <LinearGradient
                    colors={['rgba(30,30,30,0.8)', 'rgba(10,10,10,0.95)']}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Gold Glow Border */}
                <View style={styles.glowBorder} />

                <View style={styles.content}>
                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <Image source={worker.image} style={styles.avatar} />
                        {worker.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.accent} />
                            </View>
                        )}
                        <View style={[styles.statusDot, { backgroundColor: worker.isOnline ? COLORS.success : '#666' }]} />
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{worker.name}</Text>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color={COLORS.accent} />
                                <Text style={styles.ratingText}>{worker.rating}</Text>
                            </View>
                        </View>

                        <Text style={styles.role}>{worker.role}</Text>

                        {/* Skills / Tags */}
                        <View style={styles.tagsRow}>
                            {worker.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={12} color="#666" />
                            <Text style={styles.locationText}>{worker.distance} • {worker.location}</Text>
                        </View>
                    </View>

                    {/* Action Arrow */}
                    <View style={styles.actionContainer}>
                        <View style={styles.actionBtn}>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        ...SHADOWS.medium,
    },
    glassContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    glowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.15)', // Gold border
        borderRadius: 20,
    },
    content: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    verifiedBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#000',
        borderRadius: 10,
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#000',
    },
    infoContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ratingText: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    role: {
        color: '#ccc',
        fontSize: 13,
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#aaa',
        fontSize: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        color: '#666',
        fontSize: 11,
        marginLeft: 4,
    },
    actionContainer: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,215,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
