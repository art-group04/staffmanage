import { db, getDoc, doc, addDoc, collection, getDocs, query, where, serverTimestamp } from './database.js';
import { formatDate } from './utils/formatdate.js';
import { loader, currentUser } from "./utils/loggeduser.js";

console.log("Logged in user:", currentUser);

    formatDate();


  userName.textContent = currentUser.user;
  email.textContent = currentUser.username;
  Mobile.textContent = currentUser.mobile;
  jDate.textContent = formatDate(currentUser.jDate);
  eCode.textContent = currentUser.eCode;
  address.textContent = currentUser.address;
  dob.textContent = formatDate(currentUser.dob);
  designation.textContent = currentUser.designation;
  stafid.textContent = currentUser.stafid;
  details.textContent = currentUser.iddetails;
  bank.textContent = currentUser.bank;

  function maskBankDisplay(selector) {
  document.querySelectorAll(selector).forEach(el => {
    const num = el.textContent.trim();
    if (num.length > 4) {
      const masked = num.slice(0, -4).replace(/\d/g, "*") + num.slice(-4);
      el.textContent = masked;
    }
  });
}

maskBankDisplay("#bank");
