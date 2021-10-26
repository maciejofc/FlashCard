// ------------------------------------------------
const inpKey = document.getElementById("first-text");
const inpValue = document.getElementById("second-text");
const btnInsert = document.getElementById("btn-insert");
const cards = document.getElementById("collection");
const btnClearAll = document.getElementById("btn-clear-all");
const btnOpenDB = document.getElementById("btn-open-db");
const btnViewNotes = document.getElementById("btn-view-notes");
let db = null;

// ------------------------------------------------
btnViewNotes.addEventListener("click", viewNotes);
btnOpenDB.addEventListener("click", openDB);
btnInsert.addEventListener("click", insert);
//btnClearAll.addEventListener("click", deleteAllNotes);
// ------------------------------------------------
function openDB() {
  const dbName = document.getElementById("txtDB").value;
  const dbVersion = document.getElementById("txtVersion").value;
  const request = indexedDB.open(dbName, dbVersion);
  //DDL operation only works with onopgradeneeded
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    const pNotes = db.createObjectStore("personal_notes", { keyPath: "title" });

    alert("upgrade is called");
  };
  request.onsuccess = (e) => {
    db = e.target.result;
    alert("sucess is called");
  };
  request.onerror = (_e) => {
    alert("error is called");
  };
}

function insert() {
  const key = inpKey.value;
  const value1 = inpValue.value;
  const recordToAdd = {
    title: key,
    value: value1,
  };
  // TRANSACTION
  const tx = db.transaction("personal_notes", "readwrite");
  tx.onerror = (e) => alert("error," + e.target.error);
  const pNotes = tx.objectStore("personal_notes");
  pNotes.add(recordToAdd);
}

function viewNotes() {
  const tx = db.transaction("personal_notes", "readonly");
  const pNotes = tx.objectStore("personal_notes");
  const request = pNotes.openCursor();
  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const key = cursor.key;
      const value = cursor.value.value;
      cards.innerHTML += "Key : " + key + ",Value : " + value + "<br>";

      cursor.continue();
    }
  };
}
