import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Feather } from "@expo/vector-icons";

interface Task {
    text: string;
    completed: boolean;
}

interface TodoList {
    id: number;
    name: string;
    tasks: Task[];
    newTaskText: string;
}

export default function App() {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [listName, setListName] = useState<string>("");
    const [editingTask, setEditingTask] = useState<{ listId: number; taskIndex: number } | null>(null);
    const [editText, setEditText] = useState<string>("");

    // Load data from AsyncStorage
    useEffect(() => {
        const loadLists = async () => {
            const savedLists = await AsyncStorage.getItem("todoLists");
            if (savedLists) setLists(JSON.parse(savedLists));
        };
        loadLists();
    }, []);

    // Save data to AsyncStorage
    useEffect(() => {
        AsyncStorage.setItem("todoLists", JSON.stringify(lists));
    }, [lists]);

    const addList = () => {
        if (listName.trim()) {
            setLists([...lists, { id: Date.now(), name: listName, tasks: [], newTaskText: "" }]);
            setListName("");
        }
    };

    const addTask = (listId: number) => {
        setLists(lists.map(list =>
            list.id === listId && list.newTaskText.trim()
                ? { ...list, tasks: [...list.tasks, { text: list.newTaskText, completed: false }], newTaskText: "" }
                : list
        ));
    };

    const toggleTask = (listId: number, taskIndex: number) => {
        setLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? { ...list, tasks: list.tasks.map((task, index) => index === taskIndex ? { ...task, completed: !task.completed } : task) }
                    : list
            )
        );
    };

    const removeTask = (listId: number, taskIndex: number) => {
        setLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? { ...list, tasks: list.tasks.filter((_, index) => index !== taskIndex) }
                    : list
            ).filter(list => list.tasks.length > 0)
        );
    };

    const deleteList = (listId: number) => {
        setLists(lists.filter(list => list.id !== listId));
    };

    const startEditing = (listId: number, taskIndex: number, currentText: string) => {
        setEditingTask({ listId, taskIndex });
        setEditText(currentText);
    };

    const saveEdit = () => {
        if (editingTask) {
            setLists(lists.map(list =>
                list.id === editingTask.listId
                    ? {
                        ...list,
                        tasks: list.tasks.map((task, index) =>
                            index === editingTask.taskIndex ? { ...task, text: editText.trim() || task.text } : task
                        ),
                    }
                    : list
            ));
            setEditingTask(null);
            setEditText("");
        }
    };

    const cancelEdit = () => {
        setEditingTask(null);
        setEditText("");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks Organizer</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={listName}
                    onChangeText={setListName}
                    placeholder="Enter list name..."
                />
                <TouchableOpacity style={styles.addButton} onPress={addList}>
                    <AntDesign name="pluscircle" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={lists}
                keyExtractor={(list) => list.id.toString()}
                renderItem={({ item: list }) => (
                    <View style={styles.listCard}>
                            <Text style={styles.listTitle}>{list.name}</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={list.newTaskText}
                                onChangeText={(text) => setLists(lists.map(l => l.id === list.id ? { ...l, newTaskText: text } : l))}
                                placeholder="Add a new task..."
                            />
                            <TouchableOpacity style={styles.addButton} onPress={() => addTask(list.id)}>
                                <AntDesign name="pluscircle" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {list.tasks.map((task, taskIndex) => (
                            <View key={taskIndex} style={styles.taskCard}>
                                {editingTask?.listId === list.id && editingTask.taskIndex === taskIndex ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editText}
                                        onChangeText={setEditText}
                                        onBlur={saveEdit}
                                        onSubmitEditing={saveEdit}
                                    />
                                ) : (
                                    <Text style={[styles.taskText, task.completed && styles.completedTask]} onPress={() => startEditing(list.id, taskIndex, task.text)}>
                                        {task.text}
                                    </Text>
                                )}
                                <View style={styles.taskActions}>
                                    {!editingTask || editingTask.listId !== list.id || editingTask.taskIndex !== taskIndex ? (
                                        <TouchableOpacity onPress={() => toggleTask(list.id, taskIndex)}>
                                            <Feather name="check-circle" size={20} color="green" />
                                        </TouchableOpacity>
                                    ) : null}
                                    <TouchableOpacity onPress={() => removeTask(list.id, taskIndex)}>
                                        <Feather name="trash-2" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                            <TouchableOpacity onPress={() => deleteList(list.id)} style={styles.deleteListButton}>
                                <Text style={styles.deleteListText}>Delete</Text>
                            </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF0F5"

    },
    title:{
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color:'#8B008B',
    },
    inputContainer:{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    input:{
        flex: 1,
        borderWidth: 1,
        borderColor: "#8B008B",
        padding: 10,
        borderRadius: 50,
        backgroundColor:'#8B008B',
        color:'#FFF0F5',
        fontWeight:'bold'
    },
    addButton:{
        marginLeft: 10,
        backgroundColor: "#8B008B",
        padding: 10,
        borderRadius: 5
    },
    listCard:{
        backgroundColor: "#9932CC",
        padding: 15,
        borderRadius: 5,
        marginBottom: 10
    },
    listTitle:{
        fontSize: 18,
        fontWeight: "bold",
        color:'#FFF0F5',
        marginBottom: 10,
        textAlign:'center',
        textTransform:'capitalize'
    },
    taskCard:{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        backgroundColor: "#FFF0F5",
        marginVertical: 5,
        borderRadius: 5
    },
    taskText:{
        fontSize: 16,
        color:'#8B008B'
    },
    completedTask:{
        textDecorationLine: "line-through",
        color: "gray"
    },
    editInput:{
        flex: 1,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        padding: 5
    },
    taskActions:{
        flexDirection: "row",
        gap: 10
    },
    deleteListButton: {
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#FFF0F5',
        borderRadius: 50,
        marginTop: 20,
        paddingVertical: 10
    },
    deleteListText: {
        color:'red',
        fontWeight:'bold',
        fontSize: 15
    }
});
