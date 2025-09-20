import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Clock, Save, CircleAlert as AlertTriangle, ChevronDown, X } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddTaskScreen() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Generate date options (next 30 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let displayText;
      if (i === 0) displayText = 'Idag';
      else if (i === 1) displayText = 'Imorgon';
      else {
        displayText = date.toLocaleDateString('sv-SE', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: displayText,
        fullDate: date.toLocaleDateString('sv-SE')
      });
    }
    return dates;
  };

  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({
          value: timeString,
          label: timeString
        });
      }
    }
    return times;
  };

  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  const priorities = [
    { id: 'låg', label: 'Låg prioritet', color: '#8FBC8F' },
    { id: 'medel', label: 'Medel prioritet', color: '#F39C12' },
    { id: 'hög', label: 'Hög prioritet', color: '#E74C3C' },
  ];

  const quickTasks = [
    'Inspektera kupa',
    'Varroabehandling',
    'Honungsskörd',
    'Invintring',
    'Rengöring av utrustning',
    'Beställa material',
  ];

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Fel', 'Ange en uppgift');
      return;
    }
    if (!taskDate.trim()) {
      Alert.alert('Fel', 'Ange ett datum');
      return;
    }
    if (!taskTime.trim()) {
      Alert.alert('Fel', 'Ange en tid');
      return;
    }
    if (!selectedPriority) {
      Alert.alert('Fel', 'Välj prioritet');
      return;
    }

    // Create task object
    const newTask = {
      id: Date.now(),
      task: taskTitle.trim(),
      date: taskDate.trim(),
      time: taskTime.trim(),
      priority: selectedPriority,
      notes: notes.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Save task to AsyncStorage
    const saveTask = async () => {
      try {
        const existingTasks = JSON.parse(await AsyncStorage.getItem('tasks') || '[]');
        const updatedTasks = [...existingTasks, newTask];
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      } catch (error) {
        console.log('Could not save task:', error);
      }
    };

    saveTask().then(() => {
      router.push('/');
    });
  };

  const WheelPicker = ({ 
    options, 
    selectedValue, 
    onValueChange, 
    onClose, 
    title 
  }: {
    options: {value: string, label: string}[],
    selectedValue: string,
    onValueChange: (value: string) => void,
    onClose: () => void,
    title: string
  }) => {
    const scrollViewRef = useRef(null);
    const itemHeight = 50;
    const [currentValue, setCurrentValue] = useState(selectedValue);
    
    const getInitialScrollPosition = () => {
      const index = options.findIndex((option: { value: string }) => option.value === currentValue);
      return Math.max(0, index * itemHeight);
    };

    const handleDone = () => {
      onValueChange(currentValue);
      onClose();
    };

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={onClose}>
                <X size={24} color="#8B4513" />
              </Pressable>
              <Text style={styles.pickerTitle}>{title}</Text>
              <Pressable onPress={handleDone}>
                <Text style={styles.doneButton}>Klar</Text>
              </Pressable>
            </View>
            
            <View style={styles.wheelContainer}>
              <View style={styles.selectionIndicator} />
              <ScrollView
                ref={scrollViewRef}
                style={styles.wheelScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                contentOffset={{ x: 0, y: getInitialScrollPosition() }}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
                  const selectedOption = options[index];
                  if (selectedOption) {
                    setCurrentValue(selectedOption.value);
                  }
                }}
              >
                <View style={{ height: itemHeight * 2 }} />
                {options.map((option, index) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.wheelItem,
                      currentValue === option.value && { backgroundColor: '#8FBC8F20', borderColor: '#8FBC8F' }
                    ]}
                    onPress={() => {
                      setCurrentValue(option.value);
                      (scrollViewRef.current as any)?.scrollTo({
                        y: index * itemHeight,
                        animated: true
                      });
                    }}
                  >
                    <Text style={[
                      styles.wheelItemText,
                      currentValue === option.value && styles.wheelItemTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
                <View style={{ height: itemHeight * 2 }} />
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#FFF8E1', '#F5F5DC']}
          style={styles.gradient}
        >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </Pressable>
          <Text style={styles.title}>Ny uppgift</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Snabbval</Text>
              <View style={styles.quickTasksContainer}>
                {quickTasks.map((task) => (
                  <Pressable
                    key={task}
                    style={[
                      styles.quickTaskButton,
                      taskTitle === task && styles.quickTaskButtonSelected
                    ]}
                    onPress={() => setTaskTitle(task)}
                  >
                    <Text style={[
                      styles.quickTaskText,
                      taskTitle === task && styles.quickTaskTextSelected
                    ]}>
                      {task}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Uppgift *</Text>
              <View style={styles.inputContainer}>
                <AlertTriangle size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Inspektera Kupa Alpha"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Datum & Tid *</Text>
              <View style={styles.dateTimeRow}>
                <Pressable 
                  style={[styles.inputContainer, styles.dateTimeInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#8B7355" />
                  <Text style={[styles.input, styles.dateTimeText]}>
                    {taskDate ? dateOptions.find(d => d.value === taskDate)?.label || taskDate : 'Välj datum'}
                  </Text>
                  <ChevronDown size={20} color="#8B7355" />
                </Pressable>

                <Pressable 
                  style={[styles.inputContainer, styles.dateTimeInput]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color="#8B7355" />
                  <Text style={[styles.input, styles.dateTimeText]}>
                    {taskTime || 'Välj tid'}
                  </Text>
                  <ChevronDown size={20} color="#8B7355" />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prioritet *</Text>
              <View style={styles.prioritySelector}>
                {priorities.map((priority) => (
                  <Pressable
                    key={priority.id}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority.id && [
                        styles.priorityOptionSelected,
                        { backgroundColor: priority.color + '20', borderColor: priority.color }
                      ]
                    ]}
                    onPress={() => setSelectedPriority(priority.id)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                    <Text style={[
                      styles.priorityText,
                      selectedPriority === priority.id && { color: priority.color, fontWeight: 'bold' }
                    ]}>
                      {priority.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anteckningar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ytterligare detaljer om uppgiften..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#8B7355"
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="white" />
              <Text style={styles.saveButtonText}>Spara uppgift</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>

    {/* Datum Picker Modal */}
    {showDatePicker && (
      <WheelPicker
        title="Välj datum"
        options={dateOptions}
        selectedValue={taskDate}
        onValueChange={setTaskDate}
        onClose={() => setShowDatePicker(false)}
      />
    )}

    {/* Tid Picker Modal */}
    {showTimePicker && (
      <WheelPicker
        title="Välj tid"
        options={timeOptions}
        selectedValue={taskTime}
        onValueChange={setTaskTime}
        onClose={() => setShowTimePicker(false)}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#8B4513',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTasksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTaskButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTaskButtonSelected: {
    backgroundColor: '#8FBC8F',
    borderColor: '#8FBC8F',
  },
  quickTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  quickTaskTextSelected: {
    color: 'white',
  },
  prioritySelector: {
    gap: 12,
  },
  priorityOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 16,
    color: '#8B7355',
  },
  saveButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeInput: {
    flex: 1,
    marginHorizontal: 6,
  },
  dateTimeText: {
    color: '#8B4513',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D5B7',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8FBC8F',
  },
  wheelContainer: {
    height: 250,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: '#8FBC8F20',
    borderRadius: 8,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#8FBC8F',
  },
  wheelScroll: {
    flex: 1,
  },
  wheelItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wheelItemText: {
    fontSize: 18,
    color: '#8B7355',
  },
  wheelItemTextSelected: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
});