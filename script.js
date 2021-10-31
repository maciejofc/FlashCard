import { uid } from "./uid.js";
console.log(uid());

// ------------------------------------------------
const inpKey = document.getElementById("first-text");
const inpValue = document.getElementById("second-text");
const btnInsert = document.getElementById("btn-insert");
const cards = document.getElementById("collection");
const btnClearAll = document.getElementById("btn-clear-all");
const btnOpenDB = document.getElementById("btn-open-db");
const btnViewNotes = document.getElementById("btn-view-notes");
const list = document.getElementById("list");

const IDB = (function init() {
  var db = null;
  let objectStore = null;
  let DBOpenReq = indexedDB.open("flashCardDB", 3);

  DBOpenReq.addEventListener("error", (err) => {
    //Error occurred while trying to open DB
    console.warn(err);
  });
  DBOpenReq.addEventListener("success", (ev) => {
    //DB has been opened... after upgradeneeded
    db = ev.target.result;
    console.log("success", db);
    buildList();
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
  });

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
    let tx = makeTX("flashCardStore", "readwrite");
    tx.oncomplete = (ev) => {
      console.log(ev);
      clearInput();
      buildList();
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
  function makeTX(storeName, mode) {
    let tx = db.transaction(storeName, mode);
    tx.onerror = (err) => {
      console.warn(err);
    };

    return tx;
  }
  // WE CAN DO FINAL THINGS IN TX ON COMPLETE OR getReq onsuccess
  function buildList() {
    let list = document.getElementById("list");
    list.innerHTML = "<li>Loading...</li>";
    let tx = makeTX("flashCardStore", "readonly");
    tx.oncomplete = (ev) => {};
    let store = tx.objectStore("flashCardStore");
    let getReq = store.getAll();
    // return an array
    //optional can pass keyRange
    getReq.onsuccess = (ev) => {
      //getAll was successful
      let request = ev.target; //request === getReq ===ev.target
      console.log({ request });
      list.innerHTML = request.result
        .map((card) => {
          return `<li  class="item" data-key = "${card.id}"><span>${card.firstCard}</span>${card.secondCard} <button type="button">Update</button> <button type="button">Delete</button> </li>`;
        })
        .join("\n");
    };
    getReq.onerror = (err) => {
      console.warn(err);
    };
  }

  list.addEventListener('click',(ev) =>{
    let li = ev.target.closest('[data-key]');
    let id = li.getAttribute('data-key');
    console.log(id);
  })
  function clearInput() {
    inpKey.value = 0;
    inpValue.value = 0;
  }
})();
