import {  db,  getDoc,  doc,  addDoc,  updateDoc,  deleteDoc,  collection,  getDocs,  query,  where,  serverTimestamp,} from "./database.js";
import { loader, currentUser } from "./utils/loggeduser.js";
import { formatDate } from './utils/formatdate.js';

console.log("Logged in user:", currentUser);
formatDate()
// ---------------- ELEMENTS ----------------
const levTypeEl = document.getElementById("levType");
const levTimeEl = document.getElementById("levTime");
const levDateEl = document.getElementById("levDate");
const levToDateEl = document.getElementById("levToDate");
const levReasonEl = document.getElementById("levReason");

const CancelAplitn = document.getElementById("CancelAplitn");
const ConfirmLev = document.getElementById("ConfirmLev");
const leavePopup = document.getElementById("leavePopup");

// ---------------- DISPLAY ELEMENTS ----------------
const ApplyDate = document.getElementById("ApplyDate");
const leaveDate = document.getElementById("leaveDate");
const leaveStatus = document.getElementById("leaveStatus");

const alyLeav = document.getElementById("alyLeav");
const cslLeav = document.getElementById("cslLeav");

const todayStr = new Date().toISOString().slice(0, 10);
let todayLeaveDocId = null; 

// 🔹 Load today's leave data
async function loadTodayLeave() {
  try {
    const leaveRef = query(
      collection(db, "leaveapply"),
      where("userId", "==", currentUser.id),
      where("dateStr", "==", todayStr)
    );

    const snapshot = await getDocs(leaveRef);

    if (snapshot.empty) {
      ApplyDate.textContent = "-";
      leaveDate.textContent = "-";
      leaveStatus.textContent = "-";
      todayLeaveDocId = null;
      cslLeav.style.display = "none"; // hide cancel if no leave  
      return;
    }

    // ✅ show leave data
    const docData = snapshot.docs[0].data();
    todayLeaveDocId = snapshot.docs[0].id;

    ApplyDate.textContent = formatDate(docData.dateStr) || "-";
    leaveDate.textContent = formatDate(docData.levDate) || "-";
    leaveStatus.textContent = docData.leaveStatus || "Pending";

    cslLeav.style.display = "inline-block";
  } catch (err) {
    console.error("Error loading leave:", err);
  }
}

// 🔹 Apply Leave
ConfirmLev.onclick = async () => {
  const levType = levTypeEl.value;
  const levTime = levTimeEl.value;
  const levDate = levDateEl.value;
  const levToDate = levToDateEl.value;
  const levReason = levReasonEl.value.trim();

  if (!levType || !levDate || !levReason) {
    alert("Please fill in all required fields!");
    return;
  }

  try {
    const leaveRef = collection(db, "leaveapply");
    const q = query(
      leaveRef,
      where("userId", "==", currentUser.id),
      where("levDate", "==", levDate)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("You have already applied for leave on this date!");
      if (leavePopup) leavePopup.style.display = "none";
      return;
    }

    // ✅ Add new leave record
    const docRef = await addDoc(leaveRef, {
      userId: currentUser.id,
      username: currentUser.user,
      branchId: currentUser.branchId,
      designation: currentUser.designation,
      company: currentUser.company,
      levType: levType,
      levTime: levTime,
      levDate: levDate,
      levToDate: levToDate,
      levReason: levReason,
      leaveStatus: "Pending", // ✅ string value
      dateStr: todayStr, // ✅ today's string for daily filter
      createdAt: serverTimestamp(),
    });

    console.log("✅ Leave application submitted:", docRef.id);
    alert("Leave application submitted successfully!");
    if (leavePopup) leavePopup.style.display = "none"; 
    if (alyLeav) alyLeav.style.display = "none";                   

    loadTodayLeave(); // refresh leave display

  } catch (error) {
    console.error("❌ Error submitting leave application:", error);
    alert("Failed to submit leave application. Try again.");
  }
};

// 🔹 Cancel (delete) today's leave
cslLeav.onclick = async () => {
  if (!todayLeaveDocId) {
    alert("No leave to cancel today!");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to cancel today's leave?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "leaveapply", todayLeaveDocId));
    alert("Leave cancelled successfully!");
    if (alyLeav) alyLeav.style.display = "flex";
    todayLeaveDocId = null;
    loadTodayLeave(); // refresh UI
  } catch (error) {
    console.error("Error cancelling leave:", error);
    alert("Failed to cancel leave. Try again.");
  }
};

// 🔹 Initial load
loadTodayLeave();

