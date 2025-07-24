class HotelManagementApp {
    constructor() {
        this.initializeEventListeners();
        this.updateTotalGuests();
    }

    initializeEventListeners() {
        const form = document.getElementById('guestForm');
        const backBtn = document.getElementById('backToForm');
        const guestCountInputs = document.querySelectorAll('.count-item input');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        backBtn.addEventListener('click', () => this.showFrontDeskForm());

        // Update total guests when any count changes
        guestCountInputs.forEach(input => {
            input.addEventListener('input', () => this.updateTotalGuests());
        });
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

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const guestInfo = {
            guestName: formData.get('guestName'),
            stayDays: formData.get('stayDays'),
            roomNumber: formData.get('roomNumber'),
            region: formData.get('region'),
            bookingSource: formData.get('bookingSource'),
            howKnow: formData.get('howKnow'),
            adultMen: parseInt(formData.get('adultMen')) || 0,
            adultWomen: parseInt(formData.get('adultWomen')) || 0,
            children: parseInt(formData.get('children')) || 0,
            infantsWithMeal: parseInt(formData.get('infantsWithMeal')) || 0,
            infantsNoMeal: parseInt(formData.get('infantsNoMeal')) || 0,
            additionalInfo: formData.get('additionalInfo')
        };

        guestInfo.totalGuests = guestInfo.adultMen + guestInfo.adultWomen + 
                               guestInfo.children + guestInfo.infantsWithMeal + 
                               guestInfo.infantsNoMeal;

        this.displayCleaningInfo(guestInfo);
    }

    displayCleaningInfo(guestInfo) {
        const cleaningInfoDiv = document.getElementById('cleaningInfo');
        
        const isForeign = guestInfo.region === 'other';
        
        cleaningInfoDiv.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <strong>部屋番号 / Room Number:</strong>
                    <span style="font-size: 24px; font-weight: bold; color: #d32f2f;">${guestInfo.roomNumber}</span>
                </div>
                <div class="info-item">
                    <strong>宿泊日数 / Days:</strong>
                    <span style="font-size: 20px; font-weight: bold;">${guestInfo.stayDays} 日</span>
                </div>
                <div class="info-item">
                    <strong>合計人数 / Total Guests:</strong>
                    <span style="font-size: 20px; font-weight: bold; color: #1976d2;">${guestInfo.totalGuests} 名</span>
                </div>
            </div>

            ${isForeign ? `
                <div class="foreign-guest-alert">
                    <strong>⚠️ 海外からのお客様 / FOREIGN GUEST ⚠️</strong>
                    <br>
                    <span>特別な配慮が必要な場合があります</span>
                </div>
            ` : ''}

            <div class="guest-breakdown">
                <h3>👥 宿泊者詳細 / Guest Details</h3>
                <div class="guest-list">
                    ${guestInfo.adultMen > 0 ? `
                        <div class="guest-item">
                            <span>👨 成人男性 / Adult Men</span>
                            <span class="guest-count">${guestInfo.adultMen}</span>
                        </div>
                    ` : ''}
                    ${guestInfo.adultWomen > 0 ? `
                        <div class="guest-item">
                            <span>👩 成人女性 / Adult Women</span>
                            <span class="guest-count">${guestInfo.adultWomen}</span>
                        </div>
                    ` : ''}
                    ${guestInfo.children > 0 ? `
                        <div class="guest-item">
                            <span>🧒 小学生 / Children</span>
                            <span class="guest-count">${guestInfo.children}</span>
                        </div>
                    ` : ''}
                    ${guestInfo.infantsWithMeal > 0 ? `
                        <div class="guest-item">
                            <span>👶 幼児(食事有) / Infants (meal)</span>
                            <span class="guest-count">${guestInfo.infantsWithMeal}</span>
                        </div>
                    ` : ''}
                    ${guestInfo.infantsNoMeal > 0 ? `
                        <div class="guest-item">
                            <span>👶 幼児(食事無) / Infants (no meal)</span>
                            <span class="guest-count">${guestInfo.infantsNoMeal}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${guestInfo.additionalInfo ? `
                <div class="additional-info">
                    <strong>📝 追加情報 / Additional Information:</strong>
                    <p>${guestInfo.additionalInfo}</p>
                </div>
            ` : ''}
        `;

        this.showCleaningView();
    }

    showCleaningView() {
        document.getElementById('frontDeskForm').style.display = 'none';
        document.getElementById('cleaningView').style.display = 'block';
    }

    showFrontDeskForm() {
        document.getElementById('frontDeskForm').style.display = 'block';
        document.getElementById('cleaningView').style.display = 'none';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HotelManagementApp();
});