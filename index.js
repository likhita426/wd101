
document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const registrationForm = document.getElementById('registrationForm');
    const registeredUsersTableBody = document.querySelector('#registeredUsersTable tbody');
    const dobInput = document.getElementById('dob');
    const dobError = document.getElementById('dobError');
    const acceptTermsInput = document.getElementById('acceptTerms');

    // --- NEW ADDITION TO CLEAR LOCALSTORAGE ON EVERY PAGE LOAD ---
    localStorage.clear(); // This line will empty all localStorage data for this domain
    // If you only want to clear data for THIS specific application (key 'registeredUsers'), use:
    // localStorage.removeItem('registeredUsers');
    // For this scenario, clearing all is likely what you mean by "fresh"
    // --- END NEW ADDITION ---

    // Helper function to calculate age from a given date of birth string (YYYY-MM-DD)
    function calculateAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Function to validate the Date of Birth input field based on age range
    function validateDob() {
        const dobValue = dobInput.value;
        if (!dobValue) {
            dobError.textContent = 'Date of Birth is required.';
            dobInput.setCustomValidity('Date of Birth is required.');
            return false;
        }

        const age = calculateAge(dobValue);
        const minAge = 18;
        const maxAge = 55;

        if (age < minAge) {
            dobError.textContent = `You must be at least ${minAge} years old.`;
            dobInput.setCustomValidity(`You must be at least ${minAge} years old.`);
            return false;
        } else if (age > maxAge) {
            dobError.textContent = `You must be at most ${maxAge} years old.`;
            dobInput.setCustomValidity(`You must be at most ${maxAge} years old.`);
            return false;
        } else {
            dobError.textContent = '';
            dobInput.setCustomValidity('');
            return true;
        }
    }

    // Add event listeners for real-time DOB validation feedback
    dobInput.addEventListener('input', validateDob);
    dobInput.addEventListener('blur', validateDob);

    // Function to load registered users from localStorage and display them in the table
    function loadRegisteredUsers() {
        // IMPORTANT: Clear the table body first.
        // This ensures the table is visually empty before any (potentially empty) data is added.
        registeredUsersTableBody.innerHTML = '';
        
        // Retrieve users from localStorage. Since we cleared it earlier, this will now always be an empty array.
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || []; 

        users.forEach(user => {
            const row = registeredUsersTableBody.insertRow();
            row.insertCell().textContent = user.name;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.password;
            row.insertCell().textContent = user.dob;
            row.insertCell().textContent = user.acceptTerms ? 'true' : 'false';
        });
    }

    // Event listener for the form submission
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // --- Perform all necessary validations ---
        const isDobValid = validateDob();
        const isHtml5Valid = registrationForm.checkValidity();
        const isTermsAccepted = acceptTermsInput.checked;

        if (!isHtml5Valid || !isDobValid || !isTermsAccepted) {
            if (!isTermsAccepted) {
                alert("You must accept the terms & conditions to register.");
                acceptTermsInput.setCustomValidity("Please accept the terms & conditions.");
                acceptTermsInput.reportValidity();
            }
            registrationForm.reportValidity();
            return;
        }

        const formData = new FormData(registrationForm);
        const newUser = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            dob: formData.get('dob'),
            acceptTerms: acceptTermsInput.checked
        };

        // Retrieve the current list of registered users. This will be an empty array
        // because we cleared localStorage at the beginning of the script.
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

        users.push(newUser);

        localStorage.setItem('registeredUsers', JSON.stringify(users));

        registrationForm.reset();

        // Clear any lingering custom validation messages or error text
        dobInput.setCustomValidity('');
        dobError.textContent = '';
        acceptTermsInput.setCustomValidity('');

        loadRegisteredUsers();
    });

    // Initial call to loadRegisteredUsers when the page loads.
    // This will now always result in an empty table initially due to localStorage.clear() above.
    loadRegisteredUsers();
});