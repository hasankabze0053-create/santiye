import { useNavigation } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function VideoSplashScreen() {
    const navigation = useNavigation();
    const [status, setStatus] = useState({});

    const handleVideoFinish = (playbackStatus) => {
        if (playbackStatus.didJustFinish) {
            // Navigate to Home when video ends
            navigation.replace('Home');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Video
                style={styles.video}
                // Placeholder: User needs to put 'intro.mp4' in assets
                // For now, we use a remote dummy or comment it out until file exists
                // source={require('../../assets/intro.mp4')} 
                source={{ uri: 'https://v.ftcdn.net/05/85/97/88/240_F_585978807_hM8j6y0K8J5j6y0K8J5j6y0K8J5j6y0K.mp4' }} // Temp placeholder
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                isLooping={false}
                shouldPlay
                onPlaybackStatusUpdate={handleVideoFinish}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        width: width,
        height: height,
    },
});
