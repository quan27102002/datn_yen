// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAX6peBgQ-Su9k0sE2232f5eKU3Mq51eNE",
    authDomain: "datn-89d8d.firebaseapp.com",
    databaseURL: "https://datn-89d8d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "datn-89d8d",
    storageBucket: "datn-89d8d.appspot.com",
    messagingSenderId: "966015016684",
    appId: "1:966015016684:web:99fd59ea30dc865e624fc9"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Tham chiếu đến database
const database = firebase.database();

// Lấy các nút điều khiển
const buttonBanner = document.getElementById('buttonBanner');

// Xử lý sự kiện cho banner
buttonBanner.addEventListener('click', () => {
    toggleDevice('barrierOut');
});

// Hàm chuyển đổi trạng thái thiết bị
function toggleDevice(device) {
    const deviceRef = database.ref(device);
    deviceRef.once('value').then((snapshot) => {
        const currentState = snapshot.val();
        deviceRef.set(!currentState);
    });
}

// Lắng nghe sự thay đổi từ Firebase và cập nhật UI
function listenToDeviceChanges(device, button) {
    database.ref(device).on('value', (snapshot) => {
        const state = snapshot.val();
        button.textContent = state ? 'Tắt banner' : 'Mở banner';
        button.style.backgroundColor = state ? '#ff4136' : '#2ecc40';
    });
}

// Lắng nghe sự thay đổi cho banner
listenToDeviceChanges('barrierOut', buttonBanner);

// Lắng nghe sự thay đổi của các slot đỗ xe và cập nhật màu sắc
function listenToParkingSlotChanges(id, slot) {
    const parkingStatusDiv = document.getElementById(id);
    database.ref(slot).on('value', (snapshot) => {
        const status = snapshot.val();
        if (status === 0) {
            parkingStatusDiv.classList.remove('red');
            parkingStatusDiv.classList.add('green');
        } else if (status === 1) {
            parkingStatusDiv.classList.remove('green');
            parkingStatusDiv.classList.add('red');
        }
    });
}

// Lắng nghe sự thay đổi của các slot đỗ xe
listenToParkingSlotChanges('slot1', 'parkingSlots/slot1');
listenToParkingSlotChanges('slot2', 'parkingSlots/slot2');
listenToParkingSlotChanges('slot3', 'parkingSlots/slot3');
listenToParkingSlotChanges('slot4', 'parkingSlots/slot4');

// Khởi tạo Firebase Storage
const storage = firebase.storage();

// Hàm để lấy danh sách ảnh từ một thư mục
function getImagesFromFolder(folderName) {
    const folderRef = storage.ref(folderName);
    const imageContainer = document.getElementById('imageContainer');

    folderRef.listAll()
        .then((res) => {
            console.log(res);
            res.items.forEach((itemRef) => {
                itemRef.getDownloadURL().then((url) => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = itemRef.name;
                    img.className = 'storage-image';
                    imageContainer.appendChild(img);
                }).catch((error) => {
                    console.error("Lỗi khi lấy URL download:", error);
                });
            });
        }).catch((error) => {
            console.error("Lỗi khi liệt kê ảnh:", error);
        });
}

// Gọi hàm để lấy ảnh từ hai thư mục
getImagesFromFolder('Input/');
getImagesFromFolder('Output/');
