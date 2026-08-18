import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  return month >= 6
    ? `${year}–${year + 1}`
    : `${year - 1}–${year}`;
}

export default function FinancialYearsScreen() {
  const currentFinancialYear = getCurrentFinancialYear();

  const [financialYears, setFinancialYears] = useState([
    currentFinancialYear,
  ]);

  const [activeYear, setActiveYear] = useState(currentFinancialYear);
  const [startYear, setStartYear] = useState('');

  const addFinancialYear = () => {
    const year = Number(startYear.trim());

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      Alert.alert(
        'Invalid year',
        'Enter a valid starting year, for example 2027.'
      );
      return;
    }

    const newFinancialYear = `${year}–${year + 1}`;

    if (financialYears.includes(newFinancialYear)) {
      Alert.alert(
        'Already exists',
        'This financial year has already been added.'
      );
      return;
    }

    setFinancialYears((current) => [
      newFinancialYear,
      ...current,
    ]);

    setStartYear('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#172033"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Financial years</Text>

          <View style={styles.spacer} />
        </View>

        <Text style={styles.description}>
          Create financial years and choose which year you want to manage.
        </Text>

        {/* Add Financial Year */}
        <View style={styles.createCard}>
          <Text style={styles.label}>
            Create financial year
          </Text>

          <Text style={styles.helperText}>
            Enter the starting year.
          </Text>

          <View style={styles.createRow}>
            <TextInput
              style={styles.input}
              value={startYear}
              onChangeText={setStartYear}
              placeholder="e.g. 2027"
              placeholderTextColor="#8A94A8"
              keyboardType="number-pad"
              maxLength={4}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={addFinancialYear}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Your financial years
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {financialYears.map((year) => {
            const selected = activeYear === year;

            return (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearCard,
                  selected && styles.yearCardActive,
                ]}
                onPress={() => setActiveYear(year)}
                activeOpacity={0.7}
              >
                <View style={styles.yearLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      selected && styles.iconBoxActive,
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color="#2563EB"
                    />
                  </View>

                  <View>
                    <Text style={styles.yearTitle}>
                      {year}
                    </Text>

                    <Text style={styles.yearSubtitle}>
                      {selected ? 'Currently selected' : 'Tap to switch'}
                    </Text>
                  </View>
                </View>

                {selected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#2563EB"
                    />

                    <Text style={styles.selectedText}>
                      Active
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Financial years will be saved to your account when the database is connected.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
  },

  spacer: {
    width: 42,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7A8599',
    marginBottom: 22,
  },

  createCard: {
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 26,
  },

  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172033',
  },

  helperText: {
    fontSize: 11,
    color: '#7A8599',
    marginTop: 4,
    marginBottom: 12,
  },

  createRow: {
    flexDirection: 'row',
    gap: 10,
  },

  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 14,
    backgroundColor: '#FBFCFE',
    paddingHorizontal: 14,
    color: '#172033',
    fontSize: 14,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 12,
  },

  listContent: {
    paddingBottom: 16,
  },

  yearCard: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#E6EBF3',
    borderRadius: 17,
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  yearCardActive: {
    borderColor: '#A9CCFF',
    backgroundColor: '#F8FAFF',
  },

  yearLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconBoxActive: {
    backgroundColor: '#E4EEFF',
  },

  yearTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
  },

  yearSubtitle: {
    fontSize: 11,
    color: '#7A8599',
    marginTop: 3,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 3,
  },

  selectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FF',
    borderRadius: 15,
    padding: 14,
    marginBottom: 20,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    lineHeight: 17,
    color: '#667085',
  },
});