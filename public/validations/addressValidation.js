const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z])$/;
const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
const pincodeRegex = /^[1-9][0-9]{5}$/


const nameInput = document.getElementById('name');
const mobileinput = document.getElementById('phone');
const pincodeInput = document.getElementById('pincode');
const localityInput = document.getElementById('locality');
const districtInput = document.getElementById('district');
const addressInput = document.getElementById('address');
const stateInput = document.getElementById('state')

nameInput.addEventListener('input', validateName);
mobileinput.addEventListener('input', validateMobile);
pincodeInput.addEventListener('input', validatePincode);
localityInput.addEventListener('input', validateLocality);
districtInput.addEventListener('input', validateDistrict);
addressInput.addEventListener('input', validateAddress);
stateInput.addEventListener('input', validateState)


function validateName() {
    let name = nameInput.value.trim()

    if (name.length === 0) {
        nameErr.innerHTML = "Name required!";
        return false;
    }

    if (!name.match(nameRegex)) {
        nameErr.innerHTML = "Enter a validate name";
        return false;
    }

    nameErr.innerHTML = "";
    return true;
}

function validateMobile() {
    let mobile = mobileinput.value.trim()

    if (mobile.length === 0) {
        phoneErr.innerHTML = "Mobile required!";
        return false;
    }
    if (!mobile.match(mobileRegex)) {
        phoneErr.innerHTML = 'Enter a valid mobile no.'
        return false
    }
    phoneErr.innerHTML = ""
    return true
}


function validatePincode() {
    let pincode = pincodeInput.value.trim()

    if (pincode.length === 0) {
        pinErr.innerHTML = "Pincode required!";
        return false;
    }
    if (!pincode.match(pincodeRegex)) {
        pinErr.innerHTML = 'Enter a valid pincode no.'
        return false
    }
    pinErr.innerHTML = ""
    return true
}

function validateLocality() {
    let locality = localityInput.value.trim()

    if (locality.length === 0) {
        localityErr.innerHTML = "locality required!";
        return false;
    }
    if (!locality.match(nameRegex)) {
        localityErr.innerHTML = "Numbers or invalid characters not allowed";
        return false;
    }
    localityErr.innerHTML = "";
    return true;
}

function validateDistrict() {
    let district = districtInput.value.trim()

    if (district.length === 0) {
        districtErr.innerHTML = "district required!";
        return false;
    }
    if (!district.match(nameRegex)) {
        districtErr.innerHTML = "Not a valid district";
        return false;
    }
    districtErr.innerHTML = "";
    return true;
}

function validateAddress() {
    let address = addressInput.value.trim()

    if (address.length === 0) {
        addressErr.innerHTML = "address required!";
        return false;
    }
    
    addressErr.innerHTML = "";
    return true;
}

function validateState() {
    let state = stateInput.value.trim()

    if (state.length === 0) {
        stateErr.innerHTML = "state required!";
        return false;
    }
    if (!state.match(nameRegex)) {
        stateErr.innerHTML = "No numbers allowed";
        return false;
    }
    stateErr.innerHTML = "";
    return true;
}






function validateNewAddress(){
    return (
        validateName() &&
        validateMobile() &&
        validateLocality() &&
        validateDistrict() &&
        validatePincode() &&
        validateAddress()
    )
}