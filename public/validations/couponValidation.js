const prefixInput = document.getElementById('code')
const descriptionInput = document.getElementById("description")
const discountAmountInput = document.getElementById("discountAmount")
const minPurchaseInput = document.getElementById("minPurchase")
const expiryDateInput = document.getElementById("expiryDate")
const usageLimitInput = document.getElementById("usageLimit")


prefixInput.addEventListener('input', validateCode);
descriptionInput.addEventListener('input', validateDescription);
discountAmountInput.addEventListener('input', validateDiscount);
minPurchaseInput.addEventListener('input', validateMinPurchase);
expiryDateInput.addEventListener('input', validateExpiryDate)
usageLimitInput.addEventListener('input', validateUsageLimit)

function validateCode(){
    const code = prefixInput.value.trim();
    console.log('hy')
    if(code.length === 0){
        prefixErr.innerHTML = 'prefix required'
        return false
    }else{

        prefixErr.innerHTML = ''
    }
    
    return true
}


function validateDiscount(){
    const discount = parseFloat(discountAmountInput.value)
    
    if (isNaN(discount) || discount <= 0) {
        discountErr.innerHTML = 'discount must be a positive number';
        return false;
    }else if(discount > 10000 ){
        discountErr.innerHTML = 'discount must be less than 10000';
        return false;
    }else if(discount < 300){
        discountErr.innerHTML = 'discount must be greater than 300';
        return false;
    }else{
        discountErr.innerHTML = '';
        return true;
    }
    
}


function validateMinPurchase(){
    const minPurchase = parseFloat(minPurchaseInput.value)
    if(minPurchase <= 0){
        minPurchaseErr.innerHTML = 'Min Purchase amount required'
        return false
    }else if(minPurchase < 500 ){
        minPurchaseErr.innerHTML = 'Min Purchase amount must be >500'
        return false
    }else if(minPurchase > 10000 ){
        minPurchaseErr.innerHTML ='Min Purchase amount must be <10000'
        return false
    }else{

        minPurchaseErr.innerHTML = ''
        return true
    }

}

function validateUsageLimit(){
    const usageLimit = parseFloat(usageLimitInput.value)
    if(usageLimit <=0){
        usagelimitErr.innerHTML='usage Limit required'
        return false
    }else if(usageLimit >100){
        usagelimitErr.innerHTML='usage limit cannot be >100'
        return true
    }else{
        usagelimitErr.innerHTML=''
        return true
    }
}


function validateExpiryDate(){
    const expiryDate = expiryDateInput.value.trim()
    if(expiryDate.length === 0){
        expiryDateErr.innerHTML = 'Expiry Date required'
        return false
    }else{

        expiryDateErr.innerHTML = ''
        return true
    }
}


function validateDescription(){
    const description = descriptionInput.value.trim();
    if(description.length === 0){
        descriptionErr.innerHTML = 'Description required'
        return false
    }else{
        descriptionErr.innerHTML = ''
        return true
    }
}


  

function validateCoupon(){
    return validateCode() && validateDiscount() && validateMinPurchase() && validateExpiryDate() && validateDescription() && validateUsageLimit()
}
