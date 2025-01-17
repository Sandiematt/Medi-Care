import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AddInventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    quantity: '',
    category: '',
    price: '',
    barcode: '',
    supplier: '',
    description: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const InputField = ({ 
    label,
    value, 
    onChangeText, 
    placeholder,
    icon,
    multiline = false,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, multiline && styles.multilineWrapper]}>
        {icon && <Icon name={icon} size={18} color="#6366F1" style={styles.inputIcon} />}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            icon && styles.inputWithIcon
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Items</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="more-vertical" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.uploadArea}>
          <View style={styles.uploadIconBg}>
            <Icon name="image" size={24} color="#6366F1" />
          </View>
          <Text style={styles.uploadTitle}>Upload Images</Text>
          <Text style={styles.uploadSubtitle}>Tap to browse files</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.col}>
              <InputField
                label="Item Name"
                placeholder="Enter item name"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                icon="box"
              />
            </View>
            <View style={styles.col}>
              <InputField
                label="Department"
                placeholder="Select department"
                value={formData.department}
                onChangeText={(value) => handleChange('department', value)}
                icon="grid"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <InputField
                label="Quantity"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChangeText={(value) => handleChange('quantity', value)}
                icon="package"
              />
            </View>
            <View style={styles.col}>
              <InputField
                label="Category"
                placeholder="Select category"
                value={formData.category}
                onChangeText={(value) => handleChange('category', value)}
                icon="tag"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <InputField
                label="Unit Price"
                placeholder="$0.00"
                value={formData.price}
                onChangeText={(value) => handleChange('price', value)}
                icon="dollar-sign"
              />
            </View>
            <View style={styles.col}>
              <InputField
                label="Barcode"
                placeholder="Scan or enter"
                value={formData.barcode}
                onChangeText={(value) => handleChange('barcode', value)}
                icon="hash"
              />
            </View>
          </View>

          <InputField
            label="Supplier Details"
            placeholder="Enter supplier information"
            value={formData.supplier}
            onChangeText={(value) => handleChange('supplier', value)}
            icon="truck"
          />

          <InputField
            label="Description"
            placeholder="Add any additional details about the item..."
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            multiline
            icon="file-text"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadArea: {
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddInventoryScreen;