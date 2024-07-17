// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAX6peBgQ-Su9k0sE2232f5eKU3Mq51eNE",
  authDomain: "datn-89d8d.firebaseapp.com",
  databaseURL:
    "https://datn-89d8d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "datn-89d8d",
  storageBucket: "datn-89d8d.appspot.com",
  messagingSenderId: "966015016684",
  appId: "1:966015016684:web:99fd59ea30dc865e624fc9",
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Tham chiếu đến database
const database = firebase.database();

// Lấy các nút điều khiển
const buttonBanner = document.getElementById("buttonBanner");

// Xử lý sự kiện cho banner
buttonBanner.addEventListener("click", () => {
  toggleDevice("barrierOut");
});

// Hàm chuyển đổi trạng thái thiết bị
function toggleDevice(device) {
  const deviceRef = database.ref(device);
  deviceRef.once("value").then((snapshot) => {
    const currentState = snapshot.val();
    deviceRef.set(!currentState);
  });
}

// Lắng nghe sự thay đổi từ Firebase và cập nhật UI
function listenToDeviceChanges(device, button) {
  database.ref(device).on("value", (snapshot) => {
    const state = snapshot.val();
    button.textContent = state ? "Đóng barrier" : "Mở barrier";
    button.style.backgroundColor = state ? "#ff4136" : "#2ecc40";
  });
}

// Lắng nghe sự thay đổi cho banner
listenToDeviceChanges("barrierOut", buttonBanner);

// Lắng nghe sự thay đổi của các slot đỗ xe và cập nhật màu sắc
function listenToParkingSlotChanges(id, slot) {
  const parkingStatusDiv = document.getElementById(id);
  database.ref(slot).on("value", (snapshot) => {
    const status = snapshot.val();
    if (status === 0) {
      parkingStatusDiv.classList.remove("red");
      parkingStatusDiv.classList.add("green");
    } else if (status === 1) {
      parkingStatusDiv.classList.remove("green");
      parkingStatusDiv.classList.add("red");
    }
  });
}
function getData(path) {
  return new Promise((resolve, reject) => {
    database.ref(path).on(
      "value",
      (snapshot) => {
        if (snapshot.exists()) {
          return JSON.stringify(snapshot.val());
        } else {
          reject("No data available");
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
  // database.ref(path).on('value', (snapshot) => {
  //     console.log(JSON.stringify(snapshot.val()).replace("\"", "").replace("\"","").toString());
  //     return JSON.stringify(snapshot.val()).replace("\"", "").replace("\"","").toString();
  // })
}

async function retrieveData() {
  try {
    const data = await getData("history/uid");
    console.log("Data inside retrieveData:", data);
    return data + ".jpg"; // Outputs the data at 'history/uid'
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
}

// const x = retrieveData();
// console.log("name: " +JSON.stringify(x));

// Lắng nghe sự thay đổi của các slot đỗ xe
listenToParkingSlotChanges("slot1", "parkingSlots/slot1");
listenToParkingSlotChanges("slot2", "parkingSlots/slot2");
listenToParkingSlotChanges("slot3", "parkingSlots/slot3");
listenToParkingSlotChanges("slot4", "parkingSlots/slot4");
// getData("history/uid");

// Khởi tạo Firebase Storage
const storage = firebase.storage();

// const targetImageName = getData()+".jpg";
// console.log(targetImageName);
// Hàm để lấy danh sách ảnh từ một thư mục
function getImagesFromFolder(folderName, path) {
  const folderRef = storage.ref(folderName);
  const imageContainer = document.getElementById(path);

  // Fetch the image name from the database
  const nameImagePromise = new Promise((resolve, reject) => {
    database.ref("history/uid").on(
      "value",
      (snapshot) => {
        if (snapshot.exists()) {
          resolve(JSON.stringify(snapshot.val()));
        } else {
          reject("No data available");
        }
      },
      (error) => {
        reject(error);
      }
    );
  });

  // Resolve the promise to get the image name
  nameImagePromise
    .then((nameImage) => {
      folderRef
        .listAll()
        .then((res) => {
          // console.log(JSON.stringify(res));
          res.items.forEach((itemRef) => {
            console.log(itemRef.name);
            console.log(nameImage.replace(/^"(.*)"$/, "$1"));
            console.log(itemRef.name === nameImage.replace(/^"(.*)"$/, "$1"));
            if (itemRef.name === nameImage.replace(/^"(.*)"$/, "$1")) {
              itemRef
                .getDownloadURL()
                .then((url) => {
                  const img = document.createElement("img");
                  img.src = url;
                  img.alt = nameImage;

                  img.className = "storage-image";
                  imageContainer.appendChild(img);
                })
                .catch((error) => {
                  console.error("Lỗi khi lấy URL download:", error);
                });
            }
          });
        })
        .catch((error) => {
          console.log("Lỗi khi liệt kê ảnh:", error);
        });
    })
    .catch((error) => {
      console.error("Lỗi khi lấy dữ liệu:", error);
    });
}

// Gọi hàm để lấy ảnh từ hai thư mục
getImagesFromFolder("input/", "in");
getImagesFromFolder("output/", "out");
