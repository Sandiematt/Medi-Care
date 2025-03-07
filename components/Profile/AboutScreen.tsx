import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  Image, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const AboutUs: React.FC = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Animation values for cards
    const missionScale = useRef(new Animated.Value(0.9)).current;
    const missionOpacity = useRef(new Animated.Value(0)).current;
    const teamTranslateY = useRef(new Animated.Value(50)).current;
    const teamOpacity = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Animate cards on mount
        Animated.parallel([
            Animated.timing(missionScale, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(missionOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(teamTranslateY, {
                toValue: 0,
                duration: 1000,
                delay: 400,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(teamOpacity, {
                toValue: 1,
                duration: 1000,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleImagePress = (image: any) => {
        setSelectedImage(image);
        setModalVisible(true);
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start(() => {
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
    );

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -5],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const heroScale = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [1.2, 1, 0.9],
        extrapolate: 'clamp',
    });

    const DeveloperCard = ({ image, name, role }: { image: any; name: string; role: string }) => {
        const [isPressed, setIsPressed] = useState(false);
        const cardScale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            setIsPressed(true);
            Animated.spring(cardScale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            setIsPressed(false);
            Animated.spring(cardScale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View style={[styles.developerCard, { transform: [{ scale: cardScale }] }]}>
                <TouchableOpacity 
                    onPress={() => handleImagePress(image)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <View style={styles.imageContainer}>
                        <Image style={styles.developerImage} source={image} />
                        <View style={[styles.gradient, isPressed && styles.gradientPressed]} />
                    </View>
                    <View style={styles.developerInfo}>
                        <Text style={styles.developerName}>{name}</Text>
                        <Text style={styles.developerRole}>{role}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderValueCard = ({ icon, title, text }: { icon: string; title: string; text: string }, index: number) => {
        const [isPressed, setIsPressed] = useState(false);
        const valueScale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            setIsPressed(true);
            Animated.spring(valueScale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            setIsPressed(false);
            Animated.spring(valueScale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View key={index} style={[styles.valueCard, { transform: [{ scale: valueScale }] }]}>
                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                >
                    <View style={styles.valueCardContent}>
                        <Icon name={icon} size={30} color="#4A90E2" />
                        <Text style={styles.valueTitle}>{title}</Text>
                        <Text style={styles.valueText}>{text}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.header,
                    { 
                        opacity: headerOpacity,
                        transform: [{ translateY: headerTranslateY }],
                    }
                ]}
            >
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Icon name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
            </Animated.View>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScale }] }]}>
                    <Text style={styles.heroTitle}>Revolutionizing Healthcare</Text>
                    <Text style={styles.heroSubtitle}>Making healthcare accessible for everyone</Text>
                </Animated.View>

                <Animated.View 
                    style={[
                        styles.missionSection,
                        {
                            opacity: missionOpacity,
                            transform: [{ scale: missionScale }],
                        }
                    ]}
                >
                    <View style={styles.missionCard}>
                        <Icon name="medical" size={40} color="#4A90E2" style={styles.missionIcon} />
                        <Text style={styles.missionTitle}>Our Mission</Text>
                        <Text style={styles.missionText}>
                            Medicare is dedicated to improving the healthcare experience by leveraging technology 
                            to simplify healthcare management for users.
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View 
                    style={[
                        styles.teamSection,
                        {
                            opacity: teamOpacity,
                            transform: [{ translateY: teamTranslateY }],
                        }
                    ]}
                >
                    <Text style={styles.sectionTitle}>Meet Our Team</Text>
                    <View style={styles.teamGrid}>
                        <DeveloperCard 
                            image={require('../../assets/images/sande.jpg')}
                            name="Sandeep Mathew"
                            role="Lead Developer"
                        />
                        <DeveloperCard 
                            image={require('../../assets/images/gree.jpeg')}
                            name="Greeshma Girish"
                            role="UI/UX Designer"
                        />
                    </View>
                </Animated.View>

                <View style={styles.valuesSection}>
                    <Text style={styles.sectionTitle}>Our Values</Text>
                    <View style={styles.valuesGrid}>
                        {[
                            { icon: 'heart', title: 'Patient First', text: 'Prioritizing patient care and experience' },
                            { icon: 'shield-checkmark', title: 'Security', text: 'Ensuring data privacy and protection' },
                            { icon: 'trending-up', title: 'Innovation', text: 'Constantly improving our solutions' },
                        ].map((value, index) => renderValueCard(value, index))}
                    </View>
                </View>
            </Animated.ScrollView>

            <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
                animationType="fade"
            >
                <Animated.View 
                    style={[
                        styles.modalContainer,
                        { transform: [{ scale: scaleValue }] }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Icon name="close-circle" size={32} color="#fff" />
                    </TouchableOpacity>
                    <Image style={styles.modalImage} source={selectedImage} />
                </Animated.View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginLeft: 16,
    },
    heroSection: {
        padding: 24,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Normal',
        color: '#fff',
        marginTop: 8,
        opacity: 0.9,
    },
    missionSection: {
        padding: 24,
    },
    missionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    missionIcon: {
        marginBottom: 16,
    },
    missionTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 12,
    },
    missionText: {
        fontSize: 16,
        fontFamily: 'Poppins-Normal',
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    teamSection: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 24,
    },
    teamGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    developerCard: {
        width: (width - 72) / 2,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    imageContainer: {
        position: 'relative',
    },
    developerImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    gradientPressed: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    developerInfo: {
        padding: 16,
    },
    developerName: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#333',
    },
    developerRole: {
        fontSize: 14,
        fontFamily: 'Poppins-Normal',
        color: '#666',
        marginTop: 4,
    },
    valuesSection: {
        padding: 24,
    },
    valuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    valueCard: {
        width: (width - 72) / 2,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    valueCardContent: {
        alignItems: 'center',
    },
    valueTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginTop: 12,
    },
    valueText: {
        fontSize: 14,
        fontFamily: 'Poppins-Normal',
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalImage: {
        width: width * 0.8,
        height: height * 0.5,
        resizeMode: 'contain',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});

export default AboutUs;