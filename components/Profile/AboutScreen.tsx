import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const AboutUs: React.FC = () => {
    const navigation = useNavigation(); // Initialize navigation inside the component
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const handleGoBack = () => {
        navigation.goBack(); // Navigate back to the previous screen
    };

    const handleImagePress = (image: any) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>About Us</Text>
            </View>

            <View style={styles.developersSection}>
                <Text style={styles.developersTitle}>Developers</Text>
                <View style={styles.developersList}>
                    <TouchableOpacity onPress={() => handleImagePress(require('../../assets/images/sandeep.png'))}>
                        <View style={styles.developerContainer}>
                            <Image style={styles.dev} source={require('../../assets/images/sandeep.png')} />
                            <Text style={styles.devName}>Sandeep Mathew</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleImagePress(require('../../assets/images/greeshma.png'))}>
                        <View style={styles.developerContainer}>
                            <Image style={styles.dev} source={require('../../assets/images/greeshma.png')} />
                            <Text style={styles.devName}>Greeshma Girish</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.box}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.aboutText}>
                        Meicare is dedicated to improving the healthcare experience by leveraging technology to simplify healthcare management for users. The platform aims to provide an easy-to-use, integrated system for individuals to access healthcare services, track their medical history, receive personalized care recommendations, and ensure seamless communication between patients and healthcare providers. By prioritizing patient-centric care, Meicare strives to empower individuals to take control of their health and well-being.
                    </Text>
                </ScrollView>
            </View>
            {selectedImage && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalBackground}
                            onPress={() => setModalVisible(false)}
                        >
                            <Image style={styles.fullScreenImage} source={selectedImage} />
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    backButton: {
        margin: 20,
    },
    header: {
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
    },
    title: {
        fontSize: 30,
        color: 'black',
        fontFamily: 'Poppins-Bold',
    },
    developersSection: {
        width: width,
        alignSelf: 'center',
        marginTop: 20,
    },
    developersTitle: {
        fontSize: 20,
        marginLeft: 20,
        color: 'black',
        fontFamily: 'Poppins-Bold',
    },
    developersList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    developerContainer: {
        alignItems: 'center',
    },
    dev: {
        height: 100,
        width: 100,
        borderRadius: 50,
    },
    devName: {
        fontSize: 13,
        marginTop: 5,
        color: 'black',
        fontFamily: 'Poppins-Normal',
    },
    box: {
        width: '90%',
        height: '60%',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
        padding: 20,
        marginTop: 25,
        alignSelf: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    aboutText: {
        fontSize: 15,
        lineHeight: 23,
        color: '#000',
        fontFamily: 'Poppins-Normal',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
});

export default AboutUs;
