import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
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

            if (action === "accept") {
                target.active = true;
                target.newTask = false;
                target.completed = false;
                target.failed = false;
            } else if (action === "complete") {
                target.active = false;
                target.newTask = false;
                target.completed = true;
                target.failed = false;
            } else if (action === "failed") {
                target.active = false;
                target.newTask = false;
                target.completed = false;
                target.failed = true;
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
                    if (action === "accept") {
                        target.active = true;
                        target.newTask = false;
                        target.completed = false;
                        target.failed = false;
                    } else if (action === "complete") {
                        target.active = false;
                        target.newTask = false;
                        target.completed = true;
                        target.failed = false;
                    } else if (action === "failed") {
                        target.active = false;
                        target.newTask = false;
                        target.completed = false;
                        target.failed = true;
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
