import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const PillDisplayScreen = ({ medicine }) => {
    const sampleMedicine = {
        name: "Paracetamol",
        brand: "Tylenol",
        composition: "Acetaminophen 500mg",
        usage: "For temporary relief of minor aches and pains. Reduces fever.",
        sideEffects: "Nausea, stomach pain, loss of appetite, headache, yellowing of skin or eyes",
        isCounterfeit: false,
        image: "https://example.com/medicine-image.jpg",
        dosage: "1-2 tablets every 4-6 hours",
        category: "Pain Relief",
        nextDose: "4:30 PM",
        lastTaken: "12:30 PM"
    };

    const med = medicine || sampleMedicine;

    const VerificationBadge = () => (
        <LinearGradient
            colors={med.isCounterfeit ? ['#FF416C', '#FF4B2B'] : ['#00B4DB', '#0083B0']}
            style={styles.verificationBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Icon 
                name={med.isCounterfeit ? 'alert-circle' : 'shield-check'} 
                size={20} 
                color="white" 
            />
            <Text style={styles.verificationText}>
                {med.isCounterfeit ? 'Counterfeit Alert' : 'Verified'}
            </Text>
        </LinearGradient>
    );

    const InfoCard = ({ title, content, iconName }) => (
        <View style={styles.infoCard}>
            <Icon name={iconName} size={22} color="#0083B0" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardContent}>{content}</Text>
        </View>
    );

    const TimingCard = () => (
        <View style={styles.timingCard}>
            <View style={styles.timingItem}>
                <Icon name="clock-outline" size={24} color="#0083B0" />
                <View style={styles.timingTextContainer}>
                    <Text style={styles.timingLabel}>Next Dose</Text>
                    <Text style={styles.timingValue}>{med.nextDose}</Text>
                </View>
            </View>
            <View style={styles.timingDivider} />
            <View style={styles.timingItem}>
                <Icon name="history" size={24} color="#0083B0" />
                <View style={styles.timingTextContainer}>
                    <Text style={styles.timingLabel}>Last Taken</Text>
                    <Text style={styles.timingValue}>{med.lastTaken}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.categoryContainer}>
                            <Text style={styles.category}>{med.category}</Text>
                            <VerificationBadge />
                        </View>
                        <Text style={styles.title}>{med.name}</Text>
                        <Text style={styles.brand}>{med.brand}</Text>
                    </View>

                    {/* Image Section */}
                    <View style={styles.imageSection}>
                        <Image
                            source={{ uri: med.image }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Timing Section */}
                    <TimingCard />

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <InfoCard 
                            title="Dosage" 
                            content={med.dosage}
                            iconName="pill"
                        />
                        <InfoCard 
                            title="Composition" 
                            content={med.composition}
                            iconName="flask-outline"
                        />
                        <InfoCard 
                            title="Usage" 
                            content={med.usage}
                            iconName="information-outline"
                        />
                        <InfoCard 
                            title="Side Effects" 
                            content={med.sideEffects}
                            iconName="alert-outline"
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
    },
    headerSection: {
        marginBottom: 24,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    category: {
        fontSize: 14,
        color: '#0083B0',
        fontWeight: '600',
        backgroundColor: '#E0F4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
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
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    brand: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: '500',
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
    timingCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    timingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timingTextContainer: {
        marginLeft: 12,
    },
    timingLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 2,
    },
    timingValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    timingDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E2E8F0',
        marginHorizontal: 20,
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
    },
    cardContent: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
});

export default PillDisplayScreen;