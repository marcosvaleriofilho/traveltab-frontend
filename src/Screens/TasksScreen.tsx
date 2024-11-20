import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CustomInput } from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export default function TasksScreen() {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Task name cannot be empty.');
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(), // Gera um ID único para cada tarefa
      name: taskName,
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setTaskName('');
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        onPress={() => toggleTaskCompletion(item.id)}
        style={styles.checkbox}
      >
        <MaterialCommunityIcons
          name={item.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={Theme.PRIMARY}
        />
      </TouchableOpacity>
      <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
        {item.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <CustomInput
          value={taskName}
          onChange={setTaskName}
          label="Add a new task"
          containerStyle={styles.inputContainer}
        />
        <CustomButton
          title="Add"
          color={Theme.TERTIARY}
          textColor={Theme.SECONDARY}
          onPress={handleAddTask}
          buttonStyle={styles.addButton}
          textStyle={{ fontSize: 16 }}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    width: 80,
    height: 50,
    borderRadius: 8,
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
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});
