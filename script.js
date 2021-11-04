import { uid } from "./uid.js";
console.log(uid());

// ------------------------------------------------
const inpFirstValue = document.getElementById("first-text");
const inpSecondValue = document.getElementById("second-text");
const btnInsert = document.getElementById("btn-insert");
const inpChangeFirstCard = document.getElementById("first-card-tochange");
const inpChangeSecondCard = document.getElementById("second-card-tochange");
const btnUpdate = document.getElementById("btn-modal-update");
const btnClearAll = document.getElementById("btn-clear-all");
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
    buildList();
    enablePopUp();
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
  //----------------------------------------------------------------

  //this is hoisting - we can invoke function
  //(if it is declaration function not expression function)
  //before it is declared
  //we invoke it here because we do not need to wait for content rendering
  enableAdd();

  function enableRemove() {
    const btnsRemove = document.querySelectorAll(".btn-remove");
    console.log(btnsRemove);
    btnsRemove.forEach((button) => {
      button.addEventListener("click", (ev) => {
        let li = ev.target.closest("[data-key]");
        let key = li.getAttribute("data-key");
        if (key) {
          let tx = makeTX("flashCardStore", "readwrite");
          tx.oncomplete = (ev) => {
            buildList();
          };
          tx.onerror = (err) => {
            console.warn(err);
          };
          let store = tx.objectStore("flashCardStore");
          let request = store.delete(key);
          request.onsuccess = (ev) => {
            console.log("successfully deleted a card");
          };
          request.onerror = (err) => {
            console.log("error in request to delete  a card");
          };
        }
      });
    });
  }
  enableClearAll();
  function enableClearAll() {
    btnClearAll.addEventListener("click", function () {
      let tx = makeTX("flashCardStore", "readwrite");
      tx.oncomplete = (ev) => {
        buildList();
      };
      tx.onerror = (err) => {
        console.warn(err);
      };
      let store = tx.objectStore("flashCardStore");
      let request = store.clear();
      request.onsuccess = (ev) => {
        console.log("successfully added a card");
      };
      request.onerror = (err) => {
        console.log("error in request to add  a card");
      };
    });
  }

  function enableAdd() {
    btnInsert.addEventListener("click", function () {
      const firstValue = inpFirstValue.value;
      const secondValue = inpSecondValue.value;
      let flashCard = {
        id: uid(),
        firstCard: firstValue,
        secondCard: secondValue,
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
  }

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
      let request = ev.target; //request === getReq ===ev.target
      console.log({ request });
      list.innerHTML = request.result
        .map((card) => {
          return `<li class="single-record" data-key = "${card.id}">
          
          <ul class = "phrases">
            <li class="phrase">${card.firstCard}</li>
            <li class="phrase">${card.secondCard}</li>
          </ul>

          <div class ="buttons-in-record">
            <button class = "button-svg" data-modal-target="#modal"><img class="svg-img" src="img/edit-solid.svg"></button>
            <button class = "btn-remove button-svg"><img class="svg-img"src="img/trash-alt-solid.svg"></button>
          </div>
          
          
          </li>`;
        })
        .join("\n");
      enablePopUp();
      enableRemove();
    };
    getReq.onerror = (err) => {
      console.warn(err);
    };
  }
  function clearInput() {
    inpFirstValue.value = "";
    inpSecondValue.value = "";
  }
  function enableUpdate(key) {
    btnUpdate.addEventListener("click", (ev) => {
      if (key) {
        let flashCard = {
          id: key,
          firstCard: inpChangeFirstCard.value,
          secondCard: inpChangeSecondCard.value,
        };

        let tx = makeTX("flashCardStore", "readwrite");
        tx.oncomplete = (ev) => {
          buildList();
        };
        tx.onerror = (err) => {
          console.warn(err);
        };
        let store = tx.objectStore("flashCardStore");
        let request = store.put(flashCard);
        request.onsuccess = (ev) => {
          console.log("successfully updated a card");
        };
        request.onerror = (err) => {
          console.log("error in request to update  a card");
        };
      }
    });
  }

  // ----------------------MODALS---------------
  //we invoke turnOnPopUp in building (rendering) section
  function enablePopUp() {
    const openModalButtons = document.querySelectorAll("[data-modal-target]");
    const closeModalButtons = document.querySelectorAll("[data-close-button]");
    const overlay = document.getElementById("overlay");
    openModalButtons.forEach((button) => {
      button.addEventListener("click", (ev) => {
        //javascript is automatic formating dashed to camelCase
        //choosing which modal(id) to open
        const modal = document.querySelector(button.dataset.modalTarget);
        console.log("INFO ABOUT MODAL: ");
        console.log(modal);
        let li = ev.target.closest("[data-key]");
        let key = li.getAttribute("data-key");
        let firstCard = li.children[0].innerText;
        let secondCard = li.children[1].innerText;
        inpChangeFirstCard.value = firstCard;
        inpChangeSecondCard.value = secondCard;
        openModal(modal);
        enableUpdate(key);
      });
    });

    overlay.addEventListener("click", () => {
      const modals = document.querySelectorAll(".modal.active");
      modals.forEach((modal) => {
        closeModal(modal);
      });
    });

    closeModalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        closeModal(modal);
      });
    });

    function openModal(modal) {
      if (modal == null) return;
      modal.classList.add("active");
      overlay.classList.add("active");
    }

    function closeModal(modal) {
      if (modal == null) return;
      modal.classList.remove("active");
      overlay.classList.remove("active");
    }
  }
})();
