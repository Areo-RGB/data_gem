import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

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
