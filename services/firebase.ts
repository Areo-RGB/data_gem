import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, get, set } from "firebase/database";
import { PERFORMANCE_ENTRIES } from '../constants';

// Your web app's Firebase configuration from the prompt
const firebaseConfig = {
  apiKey: "AIzaSyDcR7KzILxjXrIqe7Xe9v33C9QugQbjLuM",
  authDomain: "multi-e4d82.firebaseapp.com",
  databaseURL: "https://multi-e4d82-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "multi-e4d82",
  storageBucket: "multi-e4d82.firebasestorage.app",
  messagingSenderId: "302955593473",
  appId: "1:302955593473:web:975dc9079614ef137b6500",
  measurementId: "G-P4C0X8XWYN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const performanceEntriesRef = ref(db, 'performance_entries');

export class FirebasePermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FirebasePermissionError';
    }
}

export const seedDatabase = async () => {
    try {
        const snapshot = await get(performanceEntriesRef);
        if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
            console.log("Database is empty. Seeding with initial data...");
            const updates: { [key: string]: (string | number)[] } = {};
            PERFORMANCE_ENTRIES.forEach(entry => {
                const newEntryKey = push(performanceEntriesRef).key;
                if(newEntryKey) {
                    updates[newEntryKey] = entry;
                }
            });
            await set(performanceEntriesRef, updates);
            console.log("Database seeded successfully.");
        } else {
            console.log("Database already contains data. No seeding needed.");
        }
    } catch (error: any) {
        console.error("Error seeding database:", error);
        if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.toLowerCase().includes('permission denied'))) {
            throw new FirebasePermissionError(
                'Firebase permission denied. Please update your Realtime Database rules.'
            );
        }
        throw error; // re-throw other errors
    }
};

// The entry type that the form will produce
export interface NewPerformanceEntryData {
    date: string;
    name: string;
    team: string;
    drill: string;
    score: number;
    units: string;
    notes: string;
}

// A function to write a new performance entry
export const addPerformanceEntry = (entry: NewPerformanceEntryData) => {
    // Convert object to array to match original structure in constants.ts
    const newEntryArray = [
        entry.date,
        entry.name,
        entry.team,
        entry.drill,
        entry.score,
        entry.units,
        entry.notes
    ];
    return push(performanceEntriesRef, newEntryArray);
};

// A function to get performance entries and listen for updates
export const listenForPerformanceEntries = (callback: (data: (string | number)[][]) => void) => {
    return onValue(performanceEntriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Firebase returns an object with keys, convert it to an array of arrays
            const entriesArray = Object.values(data) as (string|number)[][];
            callback(entriesArray);
        } else {
            callback([]); // Return empty array if no data
        }
    });
};
