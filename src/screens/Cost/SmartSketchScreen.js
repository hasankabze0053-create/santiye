import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Button, Dimensions, InputAccessoryView, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';
import LuxuryCard from '../../components/LuxuryCard';
import PremiumBackground from '../../components/PremiumBackground';

const { width } = Dimensions.get('window');

// ŞEKİL TİPLERİ
const SHAPES = [
    { id: 'rect', title: 'Dikdörtgen', icon: 'square-outline' },
    { id: 'custom', title: 'Özel (Serbest)', icon: 'pencil-ruler' },
];

export default function SmartSketchScreen({ navigation, route }) {
    const [selectedShape, setSelectedShape] = useState('rect');

    // --- GELİŞMİŞ DUVAR YAPISI (ARRAY BASED) ---
    // Her duvar: { id: string, val: number, dir: number (0=Right, 1=Down, 2=Left, 3=Up) }
    const [walls, setWalls] = useState([]);
    const [undoState, setUndoState] = useState([]); // Snapshot for Undo

    // Çıkma (Konsol)
    const [hasOverhang, setHasOverhang] = useState(false);
    const [overhangDepth, setOverhangDepth] = useState(1.50);

    // Edit Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [activeWallId, setActiveWallId] = useState(null);

    // Modal Inputs
    const [inputVal, setInputVal] = useState('');
    const [inputDir, setInputDir] = useState(0); // 0=Right, 1=Down, 2=Left, 3=Up

    // INITIALIZATION
    useEffect(() => {
        if (selectedShape === 'rect') {
            setWalls([
                { id: 'w1', val: 10.00, dir: 0 },
                { id: 'w2', val: 12.00, dir: 1 },
                { id: 'w3', val: 10.00, dir: 2 },
                { id: 'w4', val: 12.00, dir: 3 },
            ]);
        } else if (selectedShape === 'custom') {
            // Start with 1 wall
            setWalls([
                { id: 'c1', val: 5.00, dir: 0 },
            ]);
        }
    }, [selectedShape]);


    // HESAPLAMALAR
    // HESAPLAMALAR
    const calculateArea = () => {
        // Shoelace Formula using virtual meter coordinates
        let vX = 0, vY = 0;
        const pts = [{ x: 0, y: 0 }];

        walls.forEach(w => {
            const val = Number(w.val || 0);
            const DIAG = 0.7071;
            let dx = 0, dy = 0;
            switch (w.dir) {
                case 0: dx = val; break;
                case 1: dy = val; break;
                case 2: dx = -val; break;
                case 3: dy = -val; break;
                case 4: dx = val * DIAG; dy = val * DIAG; break; // SE
                case 5: dx = -val * DIAG; dy = val * DIAG; break; // SW
                case 6: dx = -val * DIAG; dy = -val * DIAG; break; // NW
                case 7: dx = val * DIAG; dy = -val * DIAG; break; // NE
            }
            vX += dx;
            vY += dy;
            pts.push({ x: vX, y: vY });
        });

        if (pts.length < 3) return "0.00";
        let area = 0;
        const n = pts.length - 1;

        for (let i = 0; i < n; i++) {
            area += (pts[i].x * pts[i + 1].y - pts[i + 1].x * pts[i].y);
        }

        // Shoelace result is already in meters squared because inputs are meters
        area = Math.abs(area) / 2;
        return area.toFixed(2);
    };

    const calculatePerimeter = () => {
        return walls.reduce((sum, w) => sum + Number(w.val), 0).toFixed(2);
    };

    // MODAL HANDLERS
    const openEdit = (id) => {
        const w = walls.find(x => x.id === id);
        if (!w) return;
        setUndoState([...walls]); // Snapshot for Cancel
        setActiveWallId(id);
        setInputVal(w.val.toString());
        setInputDir(w.dir);
        setModalVisible(true);
    };

    const saveEdit = () => {
        let val = parseFloat(inputVal.replace(',', '.'));
        if (isNaN(val) || val === 0) val = 3.00; // Default to 3m if empty or 0

        setWalls(prev => prev.map(w => w.id === activeWallId ? { ...w, val, dir: inputDir } : w));
        setModalVisible(false);
        setActiveWallId(null);
    };

    const handleCancel = () => {
        setWalls(undoState);
        setModalVisible(false);
        setActiveWallId(null);
    };

    // ACTION HANDLERS
    const addWall = (targetDir) => {
        setUndoState([...walls]); // Snapshot for Cancel (before adding)
        const newId = Date.now().toString();
        const newWall = { id: newId, val: 3.00, dir: targetDir };

        setWalls([...walls, newWall]);

        // Auto Open Modal
        setActiveWallId(newId);
        setInputVal(''); // Empty so user can type immediately
        setInputDir(targetDir);
        setModalVisible(true);
    };

    const removeWall = () => {
        setUndoState([...walls]); // Snapshot
        if (activeWallId) {
            setWalls(prev => prev.filter(w => w.id !== activeWallId));
            setActiveWallId(null);
        } else if (selectedShape === 'custom' && walls.length > 0) {
            setWalls(prev => prev.slice(0, -1)); // Backspace: Remove last added wall
        }
    };


    // VISUALIZATION LOGIC
    const CANVAS_SIZE = width - 40;

    // 1. Calculate Virtual Coordinates (Meters)
    let vX = 0, vY = 0;
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    // Points in meters relative to start (0,0)
    const pointsM = [{ x: 0, y: 0 }];

    walls.forEach(w => {
        const val = Number(w.val || 0);
        const DIAG = 0.7071;
        let dx = 0, dy = 0;
        switch (w.dir) {
            case 0: dx = val; break;
            case 1: dy = val; break;
            case 2: dx = -val; break;
            case 3: dy = -val; break;
            case 4: dx = val * DIAG; dy = val * DIAG; break;
            case 5: dx = -val * DIAG; dy = val * DIAG; break;
            case 6: dx = -val * DIAG; dy = -val * DIAG; break;
            case 7: dx = val * DIAG; dy = -val * DIAG; break;
        }
        vX += dx;
        vY += dy;

        pointsM.push({ x: vX, y: vY });

        if (vX < minX) minX = vX;
        if (vX > maxX) maxX = vX;
        if (vY < minY) minY = vY;
        if (vY > maxY) maxY = vY;
    });

    // 2. Calculate Scale to Fit Canvas
    const contentW = Math.max(maxX - minX, 1); // Avoid 0
    const contentH = Math.max(maxY - minY, 1);

    const padding = 40;
    const availSize = CANVAS_SIZE - (padding * 2);

    const scaleX = availSize / contentW;
    const scaleY = availSize / contentH;

    // Choose smaller scale to fit both dimensions
    // Clamp scale: Min 0.1px/m (fit large shapes), Max 40px/m (limit zoom on small shapes)
    let dynamicScale = Math.min(scaleX, scaleY);
    dynamicScale = Math.min(Math.max(dynamicScale, 0.1), 40); // Clamp

    // 3. Calculate Center Offset
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const ox = (CANVAS_SIZE / 2) - (midX * dynamicScale);
    const oy = (CANVAS_SIZE / 2) - (midY * dynamicScale);

    // PATH GENERATOR
    let d = `M ${ox + (pointsM[0].x * dynamicScale)} ${oy + (pointsM[0].y * dynamicScale)}`;
    let labels = [];
    let anchors = [];
    let highlightPath = "";

    // Helper to get screen coords from meter coords
    const toScreen = (mx, my) => ({
        x: ox + (mx * dynamicScale),
        y: oy + (my * dynamicScale)
    });

    // RENDER LOOP
    // We already have pointsM. Let's use them.
    for (let i = 0; i < walls.length; i++) {
        const pStart = pointsM[i];
        const pEnd = pointsM[i + 1];
        const wall = walls[i];

        const sStart = toScreen(pStart.x, pStart.y);
        const sEnd = toScreen(pEnd.x, pEnd.y);

        // Draw Line
        // We can just use "L x y" since we have absolute coords now
        const cmd = `L ${sEnd.x} ${sEnd.y}`;
        if (i === 0) d = `M ${sStart.x} ${sStart.y} ` + cmd;
        else d += " " + cmd;

        // Highlight
        if (activeWallId === wall.id) {
            highlightPath = `M ${sStart.x} ${sStart.y} L ${sEnd.x} ${sEnd.y}`;
        }

        // Label Position
        labels.push({
            x: (sStart.x + sEnd.x) / 2,
            y: (sStart.y + sEnd.y) / 2,
            val: wall.val,
            id: wall.id,
            dir: wall.dir
        });

        anchors.push(sStart);
        if (i === walls.length - 1) anchors.push(sEnd);
    }

    const allLabels = [...labels];


    const handleConfirm = () => {
        navigation.navigate('DetailedCost', {
            area: calculateArea(),
            perimeter: calculatePerimeter(),
            shape: selectedShape,
            location: route.params?.location
        });
    };

    // Label Component
    const DimLabel = ({ l }) => {
        let dx = 0, dy = 0;
        if (l.dir === 0) dy = -20;
        else if (l.dir === 2) dy = 25;
        else if (l.dir === 1) dx = 35;
        else if (l.dir === 3) dx = -35;
        else if (l.dir === 4) { dx = 20; dy = 20; }
        else if (l.dir === 5) { dx = -20; dy = 20; }
        else if (l.dir === 6) { dx = -20; dy = -20; }
        else if (l.dir === 7) { dx = 20; dy = -20; }

        return (
            <G onPress={() => openEdit(l.id)}>
                {/* Compact Box: 56x28, Centered */}
                <Rect x={l.x + dx - 28} y={l.y + dy - 14} width="56" height="28" rx="5" fill="#000" stroke={activeWallId === l.id ? "#FAFA33" : "#D4AF37"} strokeWidth="1.25" />
                <SvgText x={l.x + dx} y={l.y + dy + 4} fill={activeWallId === l.id ? "#FAFA33" : "#D4AF37"} fontSize="12" fontWeight="bold" textAnchor="middle">{l.val} m</SvgText>
            </G>
        );
    };

    return (
        <PremiumBackground>
            <SafeAreaView style={{ flex: 1 }}>
                {!modalVisible && (
                    <>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>AKILLI DUVAR EDİTÖRÜ</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Shape Selector */}
                        <View style={styles.shapeSelector}>
                            {SHAPES.map(shape => (
                                <TouchableOpacity
                                    key={shape.id}
                                    style={[styles.shapeItem, selectedShape === shape.id && styles.shapeItemSelected]}
                                    onPress={() => setSelectedShape(shape.id)}
                                >
                                    <MaterialCommunityIcons name={shape.icon} size={20} color={selectedShape === shape.id ? '#000' : '#888'} />
                                    <Text style={[styles.shapeText, selectedShape === shape.id && styles.shapeTextSelected]}>{shape.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <View style={styles.canvasContainer}>
                        <Svg height={CANVAS_SIZE} width={CANVAS_SIZE} style={{ backgroundColor: '#0f0f0f' }}>
                            <Defs>
                                <Pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <Line x1="0" y1="0" x2="0" y2="20" stroke="#222" strokeWidth="1" />
                                    <Line x1="0" y1="0" x2="20" y2="0" stroke="#222" strokeWidth="1" />
                                </Pattern>
                            </Defs>
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

                            <Path d={d} fill="rgba(212, 175, 55, 0.1)" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* HIGHLIGHT ACTIVE PATH */}
                            {highlightPath ? (
                                <Path d={highlightPath} stroke="#FAFA33" strokeWidth="6" strokeLinecap="round" fill="none" />
                            ) : null}

                            {anchors.map((p, i) => (
                                <Circle key={i} cx={p.x} cy={p.y} r="3" fill="#000" stroke="#D4AF37" strokeWidth="2" />
                            ))}

                            {/* HEAD INDICATOR (Start Point for Next Wall) */}
                            {selectedShape === 'custom' && anchors.length > 0 && (
                                <Circle
                                    cx={anchors[anchors.length - 1].x}
                                    cy={anchors[anchors.length - 1].y}
                                    r="6"
                                    fill="#FAFA33"
                                    stroke="#000"
                                    strokeWidth="2"
                                />
                            )}

                            {allLabels.map((l, i) => <DimLabel key={i} l={l} />)}
                        </Svg>
                        <Text style={styles.canvasHint}>Duvarı bölmek/şekillendirmek için ölçüye dokunun</Text>
                    </View>

                    {/* CONTROL PAD (Moved to Top) */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Yön seçerek duvar ekleyin</Text>
                        <View style={styles.controlGrid}>
                            {/* Row 1 */}
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(6)}>
                                <MaterialCommunityIcons name="arrow-top-left" size={24} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(3)}>
                                <MaterialCommunityIcons name="arrow-up" size={28} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(7)}>
                                <MaterialCommunityIcons name="arrow-top-right" size={24} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>

                            {/* Row 2 */}
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(2)}>
                                <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.padBtn, { backgroundColor: '#FF3B30' }]} onPress={removeWall}>
                                <MaterialCommunityIcons name="trash-can" size={28} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(0)}>
                                <MaterialCommunityIcons name="arrow-right" size={28} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>

                            {/* Row 3 */}
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(5)}>
                                <MaterialCommunityIcons name="arrow-bottom-left" size={24} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(1)}>
                                <MaterialCommunityIcons name="arrow-down" size={28} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.padBtn} onPress={() => addWall(4)}>
                                <MaterialCommunityIcons name="arrow-bottom-right" size={24} color="#000" />
                                <MaterialCommunityIcons name="plus" size={14} color="#000" style={styles.plusBadge} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* INFO GRID (Moved to Bottom) */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>TABAN ALANI</Text>
                            <Text style={styles.infoValue}>{calculateArea()} m²</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>ÇEVRE</Text>
                            <Text style={styles.infoValue}>{calculatePerimeter()} m</Text>
                        </View>
                    </View>

                    {/* OVERHANG TOGGLE */}
                    <LuxuryCard style={styles.overhangCard}>
                        <View style={styles.rowBetween}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="balcony" size={24} color="#D4AF37" style={{ marginBottom: 4 }} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.cardTitle}>Çıkma (Konsol) Var mı?</Text>
                                    <Text style={styles.cardSubtitle}>Üst katlarda alan artışı sağlar</Text>
                                </View>
                            </View>
                            <Switch
                                value={hasOverhang}
                                onValueChange={setHasOverhang}
                                trackColor={{ false: "#333", true: "rgba(212, 175, 55, 0.5)" }}
                                thumbColor={hasOverhang ? "#D4AF37" : "#f4f3f4"}
                            />
                        </View>
                        {hasOverhang && (
                            <View style={styles.overhangInputRow}>
                                <Text style={styles.inputLabel}>Çıkma Derinliği (m):</Text>
                                <View style={styles.stepperContainer}>
                                    <TouchableOpacity onPress={() => setOverhangDepth(d => Math.max(0.5, d - 0.1))} style={styles.stepBtn}>
                                        <Ionicons name="remove" size={20} color="#D4AF37" />
                                    </TouchableOpacity>
                                    <Text style={styles.stepValue}>{overhangDepth.toFixed(1)} m</Text>
                                    <TouchableOpacity onPress={() => setOverhangDepth(d => d + 0.1)} style={styles.stepBtn}>
                                        <Ionicons name="add" size={20} color="#D4AF37" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </LuxuryCard>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                        <LinearGradient colors={['#D4AF37', '#AA8C2C']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={styles.btnText}>ÖLÇÜLERİ ONAYLA</Text>
                            <Ionicons name="checkmark-circle" size={24} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                    {/* Make KAV the top level container for correct behavior */}
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
                        {/* KAV inside Overlay (align to bottom) */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={{ width: '100%' }}
                        >
                            <View style={styles.modalContent}>
                                {/* Header Removed for Space */}
                                <View style={{ alignItems: 'flex-end', paddingBottom: 8 }}>
                                    <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
                                        <Ionicons name="close" size={28} color="#D4AF37" />
                                    </TouchableOpacity>
                                </View>

                                {/* DIRECTION SELECTOR - Minimal */}
                                {/* Direction Grid Removed */}

                                {/* Single Length Input Only */}
                                <View style={{ marginTop: 20 }}>
                                    <View style={[styles.inputGroup, { flexDirection: 'row', alignItems: 'flex-end', gap: 12 }]}>

                                        {/* Cyclical Direction Button */}
                                        <TouchableOpacity
                                            style={{
                                                width: 50, height: 50, // Compact Size
                                                backgroundColor: '#D4AF37', borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#AA8C2C'
                                            }}
                                            onPress={() => {
                                                const nextMap = { 3: 7, 7: 0, 0: 4, 4: 1, 1: 5, 5: 2, 2: 6, 6: 3 };
                                                const newDir = nextMap[inputDir] !== undefined ? nextMap[inputDir] : 3;

                                                setInputDir(newDir);
                                                setWalls(prev => prev.map(w => {
                                                    if (w.id === activeWallId) {
                                                        const currentVal = (inputVal === '') ? w.val : (parseFloat(inputVal.replace(',', '.')) || 0);
                                                        return { ...w, val: currentVal, dir: newDir };
                                                    }
                                                    return w;
                                                }));
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name={
                                                    {
                                                        0: 'arrow-right', 1: 'arrow-down', 2: 'arrow-left', 3: 'arrow-up',
                                                        4: 'arrow-bottom-right', 5: 'arrow-bottom-left', 6: 'arrow-top-left', 7: 'arrow-top-right'
                                                    }[inputDir] || 'arrow-up'
                                                }
                                                size={30}
                                                color="#000"
                                            />
                                        </TouchableOpacity>

                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            value={inputVal}
                                            onChangeText={(txt) => {
                                                setInputVal(txt);
                                                const val = parseFloat(txt.replace(',', '.')) || 0;
                                                setWalls(prev => prev.map(w => w.id === activeWallId ? { ...w, val, dir: inputDir } : w));
                                            }}
                                            keyboardType="numeric"
                                            placeholder="3.00"
                                            placeholderTextColor="#666"
                                            inputAccessoryViewID="DoneAccessory"
                                            selectTextOnFocus={true}
                                            autoFocus={true}
                                            onSubmitEditing={saveEdit}
                                            returnKeyType="done"
                                            selectionColor="#D4AF37"
                                            cursorColor="#D4AF37"
                                        />
                                    </View>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>

                    {/* KEYBOARD ACCESSORY FOR IOS */}
                    {
                        Platform.OS === 'ios' && (
                            <InputAccessoryView nativeID="DoneAccessory">
                                <View style={{ backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: '#333', paddingRight: 15, alignItems: 'flex-end', height: 45, justifyContent: 'center' }}>
                                    <Button title="Bitti" color="#D4AF37" onPress={saveEdit} />
                                </View>
                            </InputAccessoryView>
                        )
                    }
                </Modal >
            </SafeAreaView >
        </PremiumBackground >
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
    headerTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    backButton: { padding: 5 },
    shapeSelector: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
    shapeItem: { flexDirection: 'row', alignItems: 'center', padding: 10, marginRight: 10, borderRadius: 8, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333' },
    shapeItemSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
    shapeText: { color: '#888', marginLeft: 8, fontSize: 12, fontWeight: '600' },
    shapeTextSelected: { color: '#000' },
    canvasContainer: { alignItems: 'center', marginBottom: 20, backgroundColor: '#121212', borderRadius: 16, borderWidth: 1, borderColor: '#333', overflow: 'hidden', padding: 10 },
    canvasHint: { color: '#666', fontSize: 12, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
    infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    infoBox: { flex: 1, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
    infoLabel: { color: '#D4AF37', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
    infoValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    confirmBtn: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 28 },
    btnText: { color: '#000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1, marginRight: 12 },

    // MODAL
    modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', width: '100%' },
    modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 8, paddingBottom: 0, width: '100%' }, // Zero padding bottom, minimal padding
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    typeSelector: { flexDirection: 'row', backgroundColor: '#000', borderRadius: 12, padding: 4, marginBottom: 24 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
    typeBtnActive: { backgroundColor: '#D4AF37' },
    typeText: { color: '#888', fontWeight: 'bold', marginLeft: 8 },
    typeTextActive: { color: '#000' },
    inputGroup: { marginBottom: 12 }, // Reduced margin
    inputLabel: { color: '#999', fontSize: 12, marginBottom: 4, marginLeft: 2 }, // Smaller label
    input: { backgroundColor: '#121212', color: '#fff', fontSize: 20, fontWeight: 'bold', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333', height: 48 }, // Compact, Bold Input
    rowInputs: { flexDirection: 'row', marginBottom: 16 },
    inputSmall: { backgroundColor: '#000', color: '#fff', fontSize: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    saveBtn: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    saveText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    // OVERHANG
    overhangCard: { padding: 16, marginBottom: 20 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    cardSubtitle: { color: '#666', fontSize: 11, marginTop: 2 },
    overhangInputRow: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 8, padding: 4 },
    stepBtn: { padding: 4 },
    stepValue: { color: '#D4AF37', width: 60, textAlign: 'center', fontWeight: 'bold' },
    stepBtn: { padding: 4 },
    stepValue: { color: '#D4AF37', width: 60, textAlign: 'center', fontWeight: 'bold' },

    // ACTIONS
    actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    // DIR SELECTOR
    dirBtn: { alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 8 },
    dirBtnActive: { backgroundColor: '#D4AF37' },
    dirBtnInactive: { backgroundColor: 'transparent' },
    // STYLES FOR CONTROL PAD
    controlGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 200, justifyContent: 'center', gap: 8 },
    padBtn: { width: 56, height: 56, backgroundColor: '#D4AF37', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    plusBadge: { position: 'absolute', top: 4, right: 4 },
    actionRow: { display: 'none' }, // Hide old row if persists
});
