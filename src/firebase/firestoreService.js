import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { initialEmployees, initialAdmin } from "../utils/localStorage";

/**
 * Seed initial employees and admin accounts into Firestore if empty
 */
export const seedInitialDataIfEmpty = async () => {
    if (!isFirebaseConfigured || !db) return;

    try {
        const empSnapshot = await getDocs(collection(db, "employees"));
        if (empSnapshot.empty) {
            console.log("🌱 Seeding initial employees to Firestore...");
            for (const emp of initialEmployees) {
                await setDoc(doc(db, "employees", String(emp.id)), emp);
            }
            console.log("✅ Seeded employees successfully!");
        }

        const adminSnapshot = await getDocs(collection(db, "admins"));
        if (adminSnapshot.empty) {
            console.log("🌱 Seeding initial admin to Firestore...");
            for (const adm of initialAdmin) {
                await setDoc(doc(db, "admins", `admin-${adm.id}`), adm);
            }
            console.log("✅ Seeded admin successfully!");
        }
    } catch (error) {
        console.error("Error seeding initial data to Firestore:", error);
    }
};

/**
 * Subscribe to employees collection in real-time
 * @param {Function} callback - Function called with updated employee list
 * @returns {Function} unsubscribe function
 */
export const subscribeToEmployees = (callback) => {
    if (!isFirebaseConfigured || !db) {
        return () => {};
    }

    const q = collection(db, "employees");
    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const employees = [];
            snapshot.forEach((docSnap) => {
                employees.push({
                    docId: docSnap.id,
                    ...docSnap.data()
                });
            });
            // Sort by employee id
            employees.sort((a, b) => a.id - b.id);
            callback(employees);
        },
        (error) => {
            console.error("Error in subscribeToEmployees snapshot:", error);
        }
    );

    return unsubscribe;
};

/**
 * Recalculate task counts for an array of tasks
 */
const calculateTaskCounts = (tasks) => {
    return tasks.reduce(
        (acc, task) => {
            if (task.active) acc.active += 1;
            if (task.newTask) acc.newTask += 1;
            if (task.completed) acc.completed += 1;
            if (task.failed) acc.failed += 1;
            return acc;
        },
        { active: 0, newTask: 0, completed: 0, failed: 0 }
    );
};

/**
 * Add a new task to an employee by firstName
 */
export const addTaskToEmployee = async (assignToName, taskData) => {
    const newTask = {
        ...taskData,
        active: false,
        newTask: true,
        completed: false,
        failed: false,
        createdAt: new Date().toISOString()
    };

    const targetSearch = assignToName.trim().toLowerCase();

    if (isFirebaseConfigured && db) {
        try {
            // Find employee by firstName, email, or id
            const empSnapshot = await getDocs(collection(db, "employees"));
            let empDoc = null;

            empSnapshot.forEach((d) => {
                const data = d.data();
                if (
                    data.firstName?.toLowerCase() === targetSearch ||
                    data.email?.toLowerCase() === targetSearch ||
                    d.id === assignToName.trim() ||
                    String(data.id) === assignToName.trim()
                ) {
                    empDoc = d;
                }
            });

            if (!empDoc) {
                throw new Error(`Employee "${assignToName}" not found in database.`);
            }

            const currentData = empDoc.data();
            const updatedTasks = [...(currentData.tasks || []), newTask];
            const updatedCounts = calculateTaskCounts(updatedTasks);

            await updateDoc(doc(db, "employees", empDoc.id), {
                tasks: updatedTasks,
                taskCounts: updatedCounts
            });

            return { success: true, employeeName: assignToName };
        } catch (error) {
            console.error("Error adding task to Firestore:", error);
            throw error;
        }
    } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("employees")) || [];
        let found = false;
        const updated = stored.map((emp) => {
            if (
                emp.firstName?.toLowerCase() === targetSearch ||
                emp.email?.toLowerCase() === targetSearch ||
                String(emp.id) === targetSearch
            ) {
                found = true;
                const updatedTasks = [...(emp.tasks || []), newTask];
                return {
                    ...emp,
                    tasks: updatedTasks,
                    taskCounts: calculateTaskCounts(updatedTasks)
                };
            }
            return emp;
        });

        if (!found) {
            throw new Error(`Employee "${assignToName}" not found.`);
        }

        localStorage.setItem("employees", JSON.stringify(updated));
        return { success: true, employeeName: assignToName, localData: updated };
    }
};

/**
 * Update the status of a specific task for an employee
 * @param {string|number} employeeIdentifier - employee id or docId or firstName
 * @param {number} taskIndex - index of the task in employee.tasks
 * @param {'accept' | 'complete' | 'failed'} action - new status
 */
export const updateTaskStatus = async (employeeIdentifier, taskIndex, action) => {
    const targetSearch = String(employeeIdentifier).trim().toLowerCase();

    if (isFirebaseConfigured && db) {
        try {
            // Locate employee document
            let empDoc = null;
            const empSnapshot = await getDocs(collection(db, "employees"));
            empSnapshot.forEach((d) => {
                const data = d.data();
                if (
                    d.id.toLowerCase() === targetSearch ||
                    String(data.id).toLowerCase() === targetSearch ||
                    data.firstName?.toLowerCase() === targetSearch ||
                    data.email?.toLowerCase() === targetSearch
                ) {
                    empDoc = d;
                }
            });

            if (!empDoc) {
                throw new Error(`Employee not found: ${employeeIdentifier}`);
            }

            const empData = empDoc.data();
            const tasks = [...(empData.tasks || [])];

            if (!tasks[taskIndex]) {
                throw new Error(`Task index ${taskIndex} not found.`);
            }

            const target = { ...tasks[taskIndex] };

            if (action === "accept" || action === "active") {
                target.active = true;
                target.newTask = false;
                target.completed = false;
                target.failed = false;
            } else if (action === "complete" || action === "completed") {
                target.active = false;
                target.newTask = false;
                target.completed = true;
                target.failed = false;
            } else if (action === "failed") {
                target.active = false;
                target.newTask = false;
                target.completed = false;
                target.failed = true;
            } else if (action === "new" || action === "reset") {
                target.active = false;
                target.newTask = true;
                target.completed = false;
                target.failed = false;
            }

            tasks[taskIndex] = target;
            const taskCounts = calculateTaskCounts(tasks);

            await updateDoc(doc(db, "employees", empDoc.id), {
                tasks,
                taskCounts
            });

            return { success: true, updatedTasks: tasks, updatedCounts: taskCounts };
        } catch (error) {
            console.error("Error updating task status in Firestore:", error);
            throw error;
        }
    } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("employees")) || [];
        const updated = stored.map((emp) => {
            if (
                String(emp.id).toLowerCase() === targetSearch ||
                emp.docId?.toLowerCase() === targetSearch ||
                emp.firstName?.toLowerCase() === targetSearch ||
                emp.email?.toLowerCase() === targetSearch
            ) {
                const tasks = [...(emp.tasks || [])];
                if (tasks[taskIndex]) {
                    const target = { ...tasks[taskIndex] };
                    if (action === "accept" || action === "active") {
                        target.active = true;
                        target.newTask = false;
                        target.completed = false;
                        target.failed = false;
                    } else if (action === "complete" || action === "completed") {
                        target.active = false;
                        target.newTask = false;
                        target.completed = true;
                        target.failed = false;
                    } else if (action === "failed") {
                        target.active = false;
                        target.newTask = false;
                        target.completed = false;
                        target.failed = true;
                    } else if (action === "new" || action === "reset") {
                        target.active = false;
                        target.newTask = true;
                        target.completed = false;
                        target.failed = false;
                    }
                    tasks[taskIndex] = target;
                    return {
                        ...emp,
                        tasks,
                        taskCounts: calculateTaskCounts(tasks)
                    };
                }
            }
            return emp;
        });

        localStorage.setItem("employees", JSON.stringify(updated));
        return { success: true, localData: updated };
    }
};

/**
 * Authenticate user against Firestore or fallback
 */
export const authenticateCredentials = async (email, password, fallbackData) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Admin credentials check (accepts both admin@me.com and admin@example.com for convenience)
    if (
        (cleanEmail === "admin@me.com" || cleanEmail === "admin@example.com") &&
        cleanPass === "123"
    ) {
        return { role: "admin", data: { firstName: "Admin", email: cleanEmail } };
    }

    if (isFirebaseConfigured && db) {
        try {
            // Check Firestore admins
            const adminQuery = query(
                collection(db, "admins"),
                where("email", "==", cleanEmail),
                where("password", "==", cleanPass)
            );
            const adminSnap = await getDocs(adminQuery);
            if (!adminSnap.empty) {
                return { role: "admin", data: adminSnap.docs[0].data() };
            }

            // Check Firestore employees
            const empQuery = query(
                collection(db, "employees"),
                where("email", "==", cleanEmail),
                where("password", "==", cleanPass)
            );
            const empSnap = await getDocs(empQuery);
            if (!empSnap.empty) {
                const empDoc = empSnap.docs[0];
                return { role: "employee", data: { docId: empDoc.id, ...empDoc.data() } };
            }
        } catch (error) {
            console.error("Firestore authentication error:", error);
        }
    }

    // Fallback authentication with in-memory or localStorage data
    if (fallbackData && fallbackData.length > 0) {
        const found = fallbackData.find(
            (e) => e.email.toLowerCase() === cleanEmail && e.password === cleanPass
        );
        if (found) {
            return { role: "employee", data: found };
        }
    }

    return null;
};

/**
 * Add a new employee profile
 * @param {Object} employeeData - { firstName, email, password }
 */
export const addEmployeeProfile = async (employeeData) => {
    const cleanFirstName = employeeData.firstName.trim();
    const cleanEmail = employeeData.email.trim().toLowerCase();
    const cleanPassword = employeeData.password.trim();

    if (!cleanFirstName || !cleanEmail || !cleanPassword) {
        throw new Error("First name, email, and password are all required.");
    }

    const newEmp = {
        id: Date.now(),
        firstName: cleanFirstName,
        email: cleanEmail,
        password: cleanPassword,
        tasks: [],
        taskCounts: {
            active: 0,
            newTask: 0,
            completed: 0,
            failed: 0
        }
    };

    if (isFirebaseConfigured && db) {
        try {
            // Verify if email already registered
            const empSnapshot = await getDocs(collection(db, "employees"));
            let exists = false;
            empSnapshot.forEach((d) => {
                if (d.data().email?.toLowerCase() === cleanEmail) {
                    exists = true;
                }
            });

            if (exists) {
                throw new Error(`An employee with email "${cleanEmail}" already exists.`);
            }

            const docRef = doc(db, "employees", String(newEmp.id));
            await setDoc(docRef, newEmp);

            return {
                success: true,
                employee: { docId: docRef.id, ...newEmp }
            };
        } catch (error) {
            console.error("Error creating employee in Firestore:", error);
            throw error;
        }
    } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("employees")) || [];
        if (stored.some((e) => e.email?.toLowerCase() === cleanEmail)) {
            throw new Error(`An employee with email "${cleanEmail}" already exists.`);
        }

        const updated = [...stored, newEmp];
        localStorage.setItem("employees", JSON.stringify(updated));
        return { success: true, employee: newEmp, localData: updated };
    }
};

/**
 * Delete an assigned task from an employee
 * @param {string|number} employeeIdentifier - employee id, docId, or email
 * @param {number} taskIndex - index of task to remove
 */
export const deleteTaskFromEmployee = async (employeeIdentifier, taskIndex) => {
    const targetSearch = String(employeeIdentifier).trim().toLowerCase();

    if (isFirebaseConfigured && db) {
        try {
            let empDoc = null;
            const empSnapshot = await getDocs(collection(db, "employees"));
            empSnapshot.forEach((d) => {
                const data = d.data();
                if (
                    d.id.toLowerCase() === targetSearch ||
                    String(data.id).toLowerCase() === targetSearch ||
                    data.firstName?.toLowerCase() === targetSearch ||
                    data.email?.toLowerCase() === targetSearch
                ) {
                    empDoc = d;
                }
            });

            if (!empDoc) {
                throw new Error(`Employee not found: ${employeeIdentifier}`);
            }

            const empData = empDoc.data();
            const tasks = [...(empData.tasks || [])];

            if (taskIndex < 0 || taskIndex >= tasks.length) {
                throw new Error(`Task at index ${taskIndex} not found.`);
            }

            // Remove task
            tasks.splice(taskIndex, 1);
            const taskCounts = calculateTaskCounts(tasks);

            await updateDoc(doc(db, "employees", empDoc.id), {
                tasks,
                taskCounts
            });

            return { success: true, updatedTasks: tasks, updatedCounts: taskCounts };
        } catch (error) {
            console.error("Error deleting task in Firestore:", error);
            throw error;
        }
    } else {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("employees")) || [];
        let updatedTasksList = [];
        let updatedCountsList = { active: 0, newTask: 0, completed: 0, failed: 0 };

        const updated = stored.map((emp) => {
            if (
                String(emp.id).toLowerCase() === targetSearch ||
                emp.docId?.toLowerCase() === targetSearch ||
                emp.firstName?.toLowerCase() === targetSearch ||
                emp.email?.toLowerCase() === targetSearch
            ) {
                const tasks = [...(emp.tasks || [])];
                if (taskIndex >= 0 && taskIndex < tasks.length) {
                    tasks.splice(taskIndex, 1);
                    const taskCounts = calculateTaskCounts(tasks);
                    updatedTasksList = tasks;
                    updatedCountsList = taskCounts;
                    return {
                        ...emp,
                        tasks,
                        taskCounts
                    };
                }
            }
            return emp;
        });

        localStorage.setItem("employees", JSON.stringify(updated));
        return {
            success: true,
            updatedTasks: updatedTasksList,
            updatedCounts: updatedCountsList,
            localData: updated
        };
    }
};

/**
 * Delete an employee profile entirely
 * @param {string|number} employeeIdentifier
 */
export const deleteEmployeeProfile = async (employeeIdentifier) => {
    const targetSearch = String(employeeIdentifier).trim().toLowerCase();

    if (isFirebaseConfigured && db) {
        try {
            let empDoc = null;
            const empSnapshot = await getDocs(collection(db, "employees"));
            empSnapshot.forEach((d) => {
                const data = d.data();
                if (
                    d.id.toLowerCase() === targetSearch ||
                    String(data.id).toLowerCase() === targetSearch ||
                    data.firstName?.toLowerCase() === targetSearch ||
                    data.email?.toLowerCase() === targetSearch
                ) {
                    empDoc = d;
                }
            });

            if (!empDoc) {
                throw new Error(`Employee not found: ${employeeIdentifier}`);
            }

            await deleteDoc(doc(db, "employees", empDoc.id));
            return { success: true, deletedId: empDoc.id };
        } catch (error) {
            console.error("Error deleting employee from Firestore:", error);
            throw error;
        }
    } else {
        const stored = JSON.parse(localStorage.getItem("employees")) || [];
        const updated = stored.filter((emp) => {
            return !(
                String(emp.id).toLowerCase() === targetSearch ||
                emp.docId?.toLowerCase() === targetSearch ||
                emp.firstName?.toLowerCase() === targetSearch ||
                emp.email?.toLowerCase() === targetSearch
            );
        });

        localStorage.setItem("employees", JSON.stringify(updated));
        return { success: true, localData: updated };
    }
};
