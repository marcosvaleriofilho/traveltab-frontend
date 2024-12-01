import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';

interface Task {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isDone: boolean;
}

export default function TasksScreen({ route, navigation }: any) {
  const { groupId } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
        if (response.ok) {
          const group = await response.json();
          setTasks(group.tasks || []);
        } else {
          Alert.alert('Error', 'Failed to load tasks.');
        }
      } catch (error) {
        Alert.alert('Error', `Failed to load tasks: ${error}`);
      }
    };

    fetchTasks();
  }, [groupId]);

  const formatDate = (date: Date | undefined | string) =>
    date ? new Date(date).toLocaleDateString('pt-BR') : 'No Date';

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Task name cannot be empty.');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates.');
      return;
    }

    const newTask = {
      name: taskName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isDone: false,
    };

    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/${groupId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        setTasks(updatedGroup.tasks || []);
        setTaskName('');
        setStartDate(undefined);
        setEndDate(undefined);
        setModalVisible(false);
      } else {
        const errorMessage = await response.text();
        Alert.alert('Error', errorMessage || 'Failed to save task.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, isDone: !task.isDone };

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/groups/${groupId}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
        }
      );

      if (response.ok) {
        const updatedGroup = await response.json();
        setTasks(updatedGroup.tasks || []);
      } else {
        const errorMessage = await response.text();
        Alert.alert('Error', errorMessage || 'Failed to update task.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/groups/${groupId}/tasks/${taskToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const updatedGroup = await response.json();
        setTasks(updatedGroup.tasks || []);
      } else {
        Alert.alert('Error', 'Failed to delete task.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
    } finally {
      setDeleteConfirmationVisible(false);
      setTaskToDelete(null);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        onPress={() => toggleTaskCompletion(item.id)}
        style={styles.checkbox}
      >
        <MaterialCommunityIcons
          name={item.isDone ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={Theme.PRIMARY}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskText, item.isDone && styles.taskCompleted]}>
          {item.name}
        </Text>
        <View style={styles.dateRow}>
          <Text style={styles.taskDate}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          setTaskToDelete(item.id);
          setDeleteConfirmationVisible(true);
        }}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomButton
        title="Create Task"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={() => setModalVisible(true)}
      />

      {tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No tasks added yet.</Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <CustomInput
              label="Task Name"
              value={taskName}
              onChange={setTaskName}
              containerStyle={{ width: '96%' }}
            />

            <View style={styles.dateButtonsRow}>
              <TouchableOpacity
                style={[styles.dateButton, startDate && styles.selectedDateButton]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, endDate && styles.selectedDateButton]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
              />
            )}


            <View style={{flexDirection:'row'}}> 
            <CustomButton
              title="Close"
              color={Theme.SECONDARY}
              textColor={Theme.PRIMARY}
              onPress={() => setModalVisible(false)}
              buttonStyle={{ width:'45%', marginTop: 10, borderWidth: 2, borderColor: Theme.PRIMARY, marginHorizontal: 10 }}
            />

            <CustomButton
              title="Save Task"
              color={Theme.TERTIARY}
              textColor={Theme.SECONDARY}
              onPress={handleAddTask}
              buttonStyle={{ marginTop: 10, width:'50%' }}
            />
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={deleteConfirmationVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{fontFamily:'Poppins-SemiBold', fontSize: 18, textAlign: 'center'}}>Are you sure you want to delete this task?</Text>
            <View style={{flexDirection: 'row',     marginHorizontal: 0,}}>
              
            <CustomButton
              title="Cancel"
              color={Theme.SECONDARY}
              textColor={Theme.PRIMARY}
              onPress={() => setDeleteConfirmationVisible(false)}
              buttonStyle={{ marginTop: 10, width:'50%', borderWidth: 2, borderColor: Theme.INPUT }}
            />
            <CustomButton
              title="Confirm"
              color={Theme.PRIMARY}
              textColor="#fff"
              onPress={handleDeleteTask}
              buttonStyle={{ marginTop: 10, width:'50%' }}
            />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Theme.INPUT,
    fontFamily: 'Poppins-Regular',
  },
  taskList: {
    paddingVertical: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
  },
  checkbox: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    flex: 1, // Faz o texto ocupar o espaço disponível
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Theme.PRIMARY,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    width: '100%',
  },
  dateButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  dateButton: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: Theme.INPUT,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedDateButton: {
    borderColor: Theme.TERTIARY,
    backgroundColor: Theme.PASTEL,
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: Theme.PRIMARY,
  },
});
