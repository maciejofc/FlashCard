import {
  get,
  set,
  getMany,
  setMany,
  update,
  del,
  clear,
  keys,
  values,
  entries,
  createStore,
} from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

import { uid } from "./uid.js";
console.log(uid());
// ------------------------------------------------
// Unneduateky-invoked function expression IIFE
// Anynomous function that is executed right after it is created
// It has private scope
// Accesing global objects in local scope reduces the lookup time
// ------------------------------------------------

// let st = createStore('myDB','myStore');
// (function init() {

// // let st = createStore('myDB','myStore');
// let tx = st.transaction(['myStore'],'readonly');
// let objectStore = tx.objectStore('myStore');
// let countRequest = objectStore.count();
// countRequest.onsuccess = function() {
//   console.log(countRequest.result);
// }
// //To choose to which store apply data, use third argument

// // set('user_id',1,st)
// // .then(() =>{
// //   console.log("saved to my local db");
// // })

// // // SETTING BLOB!!!!!
// // let pup = [{type: 'Boxer'},{type:'Great Pyreness'}];
// // const blob = new Blob([JSON.stringify(pup,null,2)],{
// //   type:'application/json'
// // });
// // set("puppes",blob,st);

// //   set("user_id", Date.now())
// //     .then(() => {
// //       console.log("saved the user_id");
// //       //SET WILL UPDATE IF KEY ACTUALLY EXISTS
// //     })
// //     .catch(console.warn);
// //      let myobj = {
// //        id:123,
// //        name:"steve",
// //        email: "steve@work.org"
// //      };

// //      set("info",myobj)
// //      .then(() =>{
// //        console.log("saved the obj info!")
// //      })
// //      .catch(console.warn);

// //      get('info')
// //      .then((data)=>{
// //       console.log(data);
// //      })
// //      .catch(console.warn);

// //      update('user_id',(val) =>{
// //        return 3;
// //      })
// //      .then((data) => {
// //        console.log('update complete')
// //      })
// //      .catch(console.warn);

// //      //DELETING

// //      set('nope',567)
// //      .then("created nope")
// //      .catch(console.warn);

// //      del('nope')
// //      .then(() =>{
// //        console.log('deleted nope')
// //      })
// //      .catch(console.warn);

// //      keys()
// //      .then((value) =>console.log(value));

// //      values()
// //      .then((value) =>console.log(value));
// //      //ENTRIES ALL ARE RECORD
// //      entries()
// //      .then((value) =>console.log(value[0] +":"+value[1]));
//   entries(st)
//   .then((value) => insertListItem(value[0], value[1]));

// // entries(st)
// //   .then((value) => render(value));

//   })();

// ------------------------------------------------
const inpKey = document.getElementById("first-text");
const inpValue = document.getElementById("second-text");
const btnInsert = document.getElementById("btn-insert");
const cards = document.getElementById("collection");
const btnClearAll = document.getElementById("btn-clear-all");
const btnOpenDB = document.getElementById("btn-open-db");
const btnViewNotes = document.getElementById("btn-view-notes");
const list = document.getElementById("list");

function render(array) {
  const length = array.length;
  for (let i = 0; i < length; i++) {
    let record = document.createElement("li");
    let key = array[i][0];
    let value = array[i][1];
    record.textContent = key + " : " + value;
    list.appendChild(record);
  }
}
// ------------------------------------------------
// btnViewNotes.addEventListener("click", viewNotes);
// btnOpenDB.addEventListener("click", openDB);

//btnClearAll.addEventListener("click", deleteAllNotes);
// ------------------------------------------------
// function openDB() {
//   const dbName = document.getElementById("txtDB").value;
//   const dbVersion = document.getElementById("txtVersion").value;
//   const request = indexedDB.open(dbName, dbVersion);
//   //DDL operation only works with onopgradeneeded
//   request.onupgradeneeded = (e) => {
//     db = e.target.result;
//     const pNotes = db.createObjectStore("personal_notes", { keyPath: "title" });

//     alert("upgrade is called");
//   };
//   request.onsuccess = (e) => {
//     db = e.target.result;
//     alert("sucess is called");
//   };
//   request.onerror = (_e) => {
//     alert("error is called");
//   };
// }

// function insert() {
//   const key = inpKey.value;
//   const value1 = inpValue.value;
//   const recordToAdd = {
//     title: key,
//     value: value1,
//   };
//   // TRANSACTION
//   const tx = db.transaction("personal_notes", "readwrite");
//   tx.onerror = (e) => alert("error," + e.target.error);
//   const pNotes = tx.objectStore("personal_notes");
//   pNotes.add(recordToAdd);
// }

// function viewNotes() {
//   const tx = db.transaction("personal_notes", "readonly");
//   const pNotes = tx.objectStore("personal_notes");
//   const request = pNotes.openCursor();
//   request.onsuccess = (e) => {
//     const cursor = e.target.result;
//     if (cursor) {
//       const key = cursor.key;
//       const value = cursor.value.value;
//       cards.innerHTML += "Key : " + key + ",Value : " + value + "<br>";

//       cursor.continue();
//     }
//   };
// }
const IDB = (function init() {
  var db = null;
  let objectStore = null;
  let DBOpenReq = indexedDB.open("flashCardDB", 2);

  DBOpenReq.addEventListener("error", (err) => {
    //Error occurred while trying to open DB
    console.warn(err);
  });
  DBOpenReq.addEventListener("success", (ev) => {
    //DB has been opened... after upgradeneeded
    db = ev.target.result;
    console.log("success", db);
  });
  DBOpenReq.addEventListener("upgradeneeded", (ev) => {
    //first time opening this DB
    //OR a new version was passed into open()
    db = ev.target.result;
    let oldVersion = ev.oldVersion;
    let newVersion = ev.newVersion || db.version;
    console.log("DB updated from version", oldVersion, "to", newVersion);

    console.log("upgrade", db);
    if (!db.objectStoreNames.contains("flashCardStore")) {
      objectStore = db.createObjectStore("flashCardStore", {
        keyPath: "id",
      });
    }

    btnInsert.addEventListener("click", function () {
      console.log("lala");
      const key = inpKey.value;
      const value = inpValue.value;
      const record = document.createElement("li");
      record.textContent = key + " : " + value;
      let flashCard = {
        id: uid(),
        firstCard: key,
        secondCard: value,
      };
      let tx = db.transaction("flashCardStore", "readwrite");
      tx.oncomplete = (ev) => {
        console.log(ev);
      };
      tx.onerror = (err) => {
        console.warn(err);
      };
      let store = tx.objectStore("flashCardStore");
      let request = store.add(flashCard);
      request.onsuccess = (ev) => {
        console.log("successfully added a card");
      };
      request.onerror = (err) => {
        console.log("error in request to add  a card");
      };
    });
  });
})();
