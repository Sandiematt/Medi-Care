import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView ,ActivityIndicator} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { ErrorStatus } from '../../application-shared/constants/global.constants';
import { API_BASE_URL } from '@env';
interface Medicine {
    _id: string;
    name: string;
    brand: string;
    size: number;
    'image ': string; // Note: This matches the database field with space
    composition: string;
    uses: string;
    sideeffects: string;
    counterfeit: boolean;
    imprint?: string;
}

interface RouteParams {
    query: string;
}

interface Props {
    route: {
        params: RouteParams;
    };
    navigation: any;
}


const ImageDisplay = ({ uri }: { uri: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Sanitize the URI by trimming whitespace and ensuring it's a valid URL
    const sanitizedUri = uri.trim();

    return (
        <View style={styles.imageSection}>
            {sanitizedUri ? (
                <>
                    <Image
                        source={{ 
                            uri: sanitizedUri,
                            headers: {
                                'Accept': 'image/jpeg,image/png,image/*',
                                'Cache-Control': 'max-age=3600'
                            }
                        }}
                        style={styles.image}
                        resizeMode="contain"
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                        onError={() => {
                            setHasError(true);
                            setIsLoading(false);
                            console.error('Failed to load image:', sanitizedUri);
                        }}
                    />
                    {isLoading && (
                        <View style={styles.imageLoader}>
                            <ActivityIndicator size="large" color="#0083B0" />
                        </View>
                    )}
                </>
            ) : null}
            {(hasError || !sanitizedUri) && (
                <View style={styles.imageError}>
                    <Icon name="image-off" size={40} color="#64748B" />
                    <Text style={styles.imageErrorText}>Image not available</Text>
                </View>
            )}
        </View>
    );
};

const PillDisplayScreen: React.FC<Props> = ({ route, navigation }) => {
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { query } = route.params;

    // Hide the tab bar when this screen is focused
    useEffect(() => {
        // Set tab bar visibility to false for this screen
        navigation.setOptions({
            tabBarVisible: false,
        });

        // Return a cleanup function to show the tab bar when navigating away
        return () => {
            navigation.setOptions({
                tabBarVisible: true,
            });
        };
    }, [navigation]);

    useEffect(() => {
        const fetchMedicineDetails = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`${API_BASE_URL}/api/medicine`, {
                    params: { query },
                    timeout: 5000
                });

                if (response.data) {
                    setMedicine(response.data);
                } else {
                    setError('Medicine not found.');
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === ErrorStatus.NOT_FOUND) {
                        setError('Medicine not found.');
                    } else if (err.code === 'ECONNABORTED') {
                        setError('Request timed out. Please try again.');
                    } else if (!err.response) {
                        setError('Network error. Please check your connection.');
                    } else {
                        setError('Failed to fetch medicine details.');
                    }
                } else {
                    setError('An unexpected error occurred.');
                }
                console.error('Error fetching medicine:', err);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchMedicineDetails();
        }
    }, [query]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.messageText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!medicine) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.messageText}>No medicine details available</Text>
            </View>
        );
    }

    const VerificationBadge = () => (
        <LinearGradient
            colors={medicine.counterfeit ? ['#FF416C', '#FF4B2B'] : ['#00B4DB', '#0083B0']}
            style={styles.verificationBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Icon 
                name={medicine.counterfeit ? 'alert-circle' : 'shield-check'} 
                size={20} 
                color="white" 
            />
            <Text style={styles.verificationText}>
                {medicine.counterfeit ? 'Counterfeit Alert' : 'Verified'}
            </Text>
        </LinearGradient>
    );

    const InfoCard = ({ title, content, iconName }: { title: string; content: string; iconName: string }) => (
        <View style={styles.infoCard}>
            <Icon name={iconName} size={22} color="#0083B0" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardContent}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    <View style={styles.headerSection}>
                        <View style={styles.headerTop}>
                            <Text style={styles.size}>{medicine?.size}mg</Text>
                            <VerificationBadge />
                        </View>
                        <Text style={styles.title}>{medicine?.name}</Text>
                        <Text style={styles.brand}>{medicine?.brand}</Text>
                        {medicine?.imprint && (
                            <Text style={styles.imprint}>Imprint: {medicine.imprint}</Text>
                        )}
                    </View>

                    {medicine && <ImageDisplay uri={medicine['image '] || ''} />}

                    <View style={styles.infoGrid}>
                        <InfoCard 
                            title="Composition" 
                            content={medicine?.composition}
                            iconName="flask-outline"
                        />
                        <InfoCard 
                            title="Uses" 
                            content={medicine?.uses}
                            iconName="pill"
                        />
                        <InfoCard 
                            title="Side Effects" 
                            content={medicine?.sideeffects}
                            iconName="alert-circle-outline"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    headerSection: {
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    size: {
        fontSize: 14,
        color: '#0083B0',
        fontWeight: '600',
        backgroundColor: '#E0F4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    verificationText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
        fontFamily: 'Poppins-SemiBold',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
        fontFamily: 'Poppins-Bold',
    },
    brand: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    imprint: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },
    imageSection: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '47%',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardIcon: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    cardContent: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    imageLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    imageError: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    imageErrorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
    },
});

export default PillDisplayScreen;