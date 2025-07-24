class FrontDeskManager {
    constructor() {
        this.checkAccess();
        this.initializeEventListeners();
        this.updateTotalGuests();
    }

    checkAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'front-desk') {
            window.location.href = 'index.html';
        }
    }

    initializeEventListeners() {
        const form = document.getElementById('guestForm');
        const guestCountInputs = document.querySelectorAll('.count-item input');
        const roomSelect = document.getElementById('roomNumber');
        const checkInDate = document.getElementById('checkInDate');
        const stayDays = document.getElementById('stayDays');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        guestCountInputs.forEach(input => {
            input.addEventListener('input', () => this.updateTotalGuests());
        });

        // Check room availability when room, date, or stay days change
        roomSelect.addEventListener('change', () => this.checkRoomAvailability());
        checkInDate.addEventListener('change', () => this.checkRoomAvailability());
        stayDays.addEventListener('change', () => this.checkRoomAvailability());
    }

    updateTotalGuests() {
        const adultMen = parseInt(document.getElementById('adultMen').value) || 0;
        const adultWomen = parseInt(document.getElementById('adultWomen').value) || 0;
        const children = parseInt(document.getElementById('children').value) || 0;
        const infantsWithMeal = parseInt(document.getElementById('infantsWithMeal').value) || 0;
        const infantsNoMeal = parseInt(document.getElementById('infantsNoMeal').value) || 0;

        const total = adultMen + adultWomen + children + infantsWithMeal + infantsNoMeal;
        document.getElementById('totalGuests').textContent = total;
    }

    checkRoomAvailability() {
        const roomNumber = document.getElementById('roomNumber').value;
        const checkInDate = document.getElementById('checkInDate').value;
        const stayDays = parseInt(document.getElementById('stayDays').value) || 1;
        const availabilityDiv = document.getElementById('roomAvailability');

        if (!roomNumber || !checkInDate) {
            availabilityDiv.innerHTML = '';
            return;
        }

        const savedGuests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        const requestedCheckIn = new Date(checkInDate);
        const requestedCheckOut = new Date(requestedCheckIn);
        requestedCheckOut.setDate(requestedCheckOut.getDate() + stayDays);

        // Check if room is available
        const conflictingBookings = savedGuests.filter(guest => {
            if (guest.roomNumber !== roomNumber) return false;

            const guestCheckIn = new Date(guest.checkInDate);
            const guestCheckOut = new Date(guestCheckIn);
            guestCheckOut.setDate(guestCheckOut.getDate() + guest.stayDays);

            // Check for date overlap
            return requestedCheckIn < guestCheckOut && requestedCheckOut > guestCheckIn;
        });

        if (conflictingBookings.length > 0) {
            const conflict = conflictingBookings[0];
            const conflictCheckOut = new Date(conflict.checkInDate);
            conflictCheckOut.setDate(conflictCheckOut.getDate() + conflict.stayDays);

            availabilityDiv.innerHTML = `
                <div class="room-conflict">
                    ⚠️ この部屋は予約済みです / Room is occupied<br>
                    <strong>${conflict.guestName}様</strong><br>
                    ${conflict.checkInDate} ～ ${conflictCheckOut.toISOString().split('T')[0]}
                    (${conflict.stayDays}泊)
                </div>
            `;
        } else {
            availabilityDiv.innerHTML = `
                <div class="room-available">
                    ✅ この部屋は利用可能です / Room is available
                </div>
            `;
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        // Check room availability before saving
        const roomNumber = document.getElementById('roomNumber').value;
        const checkInDate = document.getElementById('checkInDate').value;
        const stayDays = parseInt(document.getElementById('stayDays').value);

        const savedGuests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        const requestedCheckIn = new Date(checkInDate);
        const requestedCheckOut = new Date(requestedCheckIn);
        requestedCheckOut.setDate(requestedCheckOut.getDate() + stayDays);

        const conflictingBookings = savedGuests.filter(guest => {
            if (guest.roomNumber !== roomNumber) return false;
            const guestCheckIn = new Date(guest.checkInDate);
            const guestCheckOut = new Date(guestCheckIn);
            guestCheckOut.setDate(guestCheckOut.getDate() + guest.stayDays);
            return requestedCheckIn < guestCheckOut && requestedCheckOut > guestCheckIn;
        });

        if (conflictingBookings.length > 0) {
            alert('⚠️ 選択した部屋と日程は既に予約済みです。別の部屋または日程を選択してください。');
            return;
        }
        
        const formData = new FormData(e.target);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const guestInfo = {
            id: Date.now(),
            guestName: formData.get('guestName'),
            checkInDate: formData.get('checkInDate'),
            stayDays: parseInt(formData.get('stayDays')),
            roomNumber: formData.get('roomNumber'),
            region: formData.get('region'),
            bookingSource: formData.get('bookingSource'),
            howKnow: formData.get('howKnow'),
            adultMen: parseInt(formData.get('adultMen')) || 0,
            adultWomen: parseInt(formData.get('adultWomen')) || 0,
            children: parseInt(formData.get('children')) || 0,
            infantsWithMeal: parseInt(formData.get('infantsWithMeal')) || 0,
            infantsNoMeal: parseInt(formData.get('infantsNoMeal')) || 0,
            additionalInfo: formData.get('additionalInfo'),
            timestamp: new Date().toISOString(),
            createdBy: currentUser.username
        };

        guestInfo.totalGuests = guestInfo.adultMen + guestInfo.adultWomen + 
                               guestInfo.children + guestInfo.infantsWithMeal + 
                               guestInfo.infantsNoMeal;

        // Save the guest info
        this.saveGuestInfo(guestInfo);
        
        // Store for calendar confirmation
        localStorage.setItem('lastSavedGuest', JSON.stringify(guestInfo));
        
        // Show success message and redirect
        alert(`✅ 予約が保存されました！\n${guestInfo.guestName}様 - 部屋${guestInfo.roomNumber}\nカレンダーページに移動します。`);
        
        // Redirect to calendar with success parameter
        window.location.href = 'calendar.html?newBooking=true';
    }

    saveGuestInfo(guestInfo) {
        let savedGuests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        savedGuests.push(guestInfo);
        localStorage.setItem('hotelGusets', JSON.stringify(savedGuests));
    }

    loadBookingHistory() {
        const savedGuests = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        return savedGuests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    displayHistory() {
        const history = this.loadBookingHistory();
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="no-data">
                    <p>📋 予約履歴がありません</p>
                    <p>No booking history available</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(guest => `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-room">🏠 ${guest.roomNumber}号室 - ${guest.guestName}様</div>
                    <div class="history-date">${guest.checkInDate}</div>
                </div>
                <div class="history-details">
                    <strong>宿泊期間:</strong> ${guest.stayDays}泊 | 
                    <strong>人数:</strong> ${guest.totalGuests}名 | 
                    <strong>地域:</strong> ${guest.region === 'japan' ? '日本' : '海外'}<br>
                    <strong>登録者:</strong> ${guest.createdBy} | 
                    <strong>登録日時:</strong> ${new Date(guest.timestamp).toLocaleString('ja-JP')}
                    ${guest.additionalInfo ? `<br><strong>追加情報:</strong> ${guest.additionalInfo}` : ''}
                </div>
            </div>
        `).join('');
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function viewHistory() {
    const manager = new FrontDeskManager();
    manager.displayHistory();
    document.getElementById('historyModal').style.display = 'flex';
}

function closeHistory() {
    document.getElementById('historyModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    new FrontDeskManager();
});